import { verifyToken } from './db.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const admin = verifyToken(req.headers.authorization);
  if (!admin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { file, mediaType } = body; // file is base64 data url e.g. "data:image/jpeg;base64,..."

    if (!file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    // Check if Cloudinary is configured
    // Format 1: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
    // Format 2: CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (process.env.CLOUDINARY_URL) {
      const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    }

    if (cloudName && apiKey && apiSecret) {
      // Direct upload to Cloudinary via REST
      const timestamp = Math.round(new Date().getTime() / 1000);
      const crypto = await import('crypto');
      const signatureStr = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', file);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('folder', 'masajes_sxm');

      const resourceType = mediaType === 'video' ? 'video' : 'image';
      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      });

      const cData = await cRes.json();
      if (cData.secure_url) {
        return res.status(200).json({
          url: cData.secure_url,
          thumbnail_url: cData.eager?.[0]?.secure_url || cData.secure_url,
          format: cData.format,
          resource_type: cData.resource_type
        });
      } else {
        throw new Error(cData.error?.message || 'Error al subir a Cloudinary');
      }
    }

    // Fallback: If Cloudinary is not yet configured, return instructions
    return res.status(200).json({
      url: file, // data uri fallback for local testing
      warning: 'Para almacenamiento persistente masivo en producción, configura CLOUDINARY_URL en tus variables de entorno.'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error al procesar archivo: ' + error.message });
  }
}
