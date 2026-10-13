import { getDb, initTables, verifyToken } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initTables();
    const sql = getDb();
    const adminUser = verifyToken(req.headers.authorization);

    // GET: Public list of gallery items
    if (req.method === 'GET') {
      const items = await sql`
        SELECT * FROM gallery ORDER BY created_at DESC;
      `;
      return res.status(200).json(items);
    }

    // All other operations require admin authorization
    if (!adminUser) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // POST: Create gallery item
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { title, description, media_type, url, thumbnail_url } = body;

      if (!url || !url.trim()) {
        return res.status(400).json({ error: 'La URL de la foto o video es obligatoria' });
      }

      const type = (media_type === 'video' ? 'video' : 'image');
      const rows = await sql`
        INSERT INTO gallery (title, description, media_type, url, thumbnail_url)
        VALUES (${(title || '').trim() || null}, 
                ${(description || '').trim() || null}, 
                ${type}, 
                ${url.trim()}, 
                ${(thumbnail_url || '').trim() || null})
        RETURNING *;
      `;

      return res.status(201).json({ ok: true, item: rows[0] });
    }

    // PUT: Update gallery item
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { id, title, description, media_type, url, thumbnail_url } = body;

      if (!id) {
        return res.status(400).json({ error: 'Se requiere el id del elemento' });
      }
      if (!url || !url.trim()) {
        return res.status(400).json({ error: 'La URL de la foto o video es obligatoria' });
      }

      const type = (media_type === 'video' ? 'video' : 'image');
      const rows = await sql`
        UPDATE gallery
        SET title = ${(title || '').trim() || null},
            description = ${(description || '').trim() || null},
            media_type = ${type},
            url = ${url.trim()},
            thumbnail_url = ${(thumbnail_url || '').trim() || null}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }

      return res.status(200).json({ ok: true, item: rows[0] });
    }

    // DELETE: Delete gallery item
    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const itemId = id || body.id;

      if (!itemId) {
        return res.status(400).json({ error: 'Se requiere el id del elemento' });
      }

      await sql`DELETE FROM gallery WHERE id = ${itemId};`;
      return res.status(200).json({ ok: true, message: 'Elemento eliminado de la galería' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in gallery handler:', error);
    return res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
}
