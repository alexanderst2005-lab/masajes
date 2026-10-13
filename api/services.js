import { getDb, initTables, verifyToken } from './db.js';

// Cleans the list of price options sent by the admin panel
function cleanOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => ({
      time: String((o && o.time) || '').trim(),
      price: String((o && o.price) || '').trim()
    }))
    .filter((o) => o.time || o.price)
    .slice(0, 10);
}

function readBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
}

function cleanText(value) {
  return String(value || '').trim() || null;
}

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

    // GET: public list of custom services
    if (req.method === 'GET') {
      const items = await sql`
        SELECT * FROM services ORDER BY sort_order ASC, id ASC;
      `;
      return res.status(200).json(items);
    }

    // All other operations require admin authorization
    const adminUser = verifyToken(req.headers.authorization);
    if (!adminUser) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // POST: create service
    if (req.method === 'POST') {
      const { name_es, name_en, desc_es, desc_en, options, image_url } = readBody(req);

      if (!cleanText(name_es) && !cleanText(name_en)) {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }

      const rows = await sql`
        INSERT INTO services (name_es, name_en, desc_es, desc_en, options, image_url)
        VALUES (${cleanText(name_es)},
                ${cleanText(name_en)},
                ${cleanText(desc_es)},
                ${cleanText(desc_en)},
                ${JSON.stringify(cleanOptions(options))}::jsonb,
                ${cleanText(image_url)})
        RETURNING *;
      `;
      return res.status(201).json({ ok: true, item: rows[0] });
    }

    // PUT: update service
    if (req.method === 'PUT') {
      const { id, name_es, name_en, desc_es, desc_en, options, image_url } = readBody(req);

      if (!id) {
        return res.status(400).json({ error: 'Se requiere el id del servicio' });
      }
      if (!cleanText(name_es) && !cleanText(name_en)) {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }

      const rows = await sql`
        UPDATE services
        SET name_es = ${cleanText(name_es)},
            name_en = ${cleanText(name_en)},
            desc_es = ${cleanText(desc_es)},
            desc_en = ${cleanText(desc_en)},
            options = ${JSON.stringify(cleanOptions(options))}::jsonb,
            image_url = ${cleanText(image_url)}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      return res.status(200).json({ ok: true, item: rows[0] });
    }

    // DELETE: remove service
    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      const itemId = id || readBody(req).id;

      if (!itemId) {
        return res.status(400).json({ error: 'Se requiere el id del servicio' });
      }

      await sql`DELETE FROM services WHERE id = ${itemId};`;
      return res.status(200).json({ ok: true, message: 'Servicio eliminado' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in services handler:', error);
    return res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
}
