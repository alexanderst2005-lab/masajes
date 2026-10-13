import { verifyToken } from './db.js';
import crypto from 'crypto';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const admin = verifyToken(req.headers.authorization);
  if (!admin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ofcfneae';
  let apiKey = process.env.CLOUDINARY_API_KEY || '656457798358727';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '_HnI1YJrLvrm98mGah9oREWD3AI';

  if (process.env.CLOUDINARY_URL) {
    const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
    }
  }

  // GET: Provide signed credentials for DIRECT upload from browser to Cloudinary
  // This bypasses Vercel's 4.5MB request limit completely!
  if (req.method === 'GET') {
    try {
      const { type } = req.query || {};
      const resourceType = type === 'video' ? 'video' : 'image';
      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'masajes_sxm';
      const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      return res.status(200).json({
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
        resourceType,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error generando firma: ' + err.message });
    }
  }

  // POST: Fallback upload
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { file, mediaType } = body;

      if (!file) {
        return res.status(400).json({ error: 'No se envió ningún archivo' });
      }

      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'masajes_sxm';
      const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', file);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('folder', folder);

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
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Error al procesar archivo: ' + error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
