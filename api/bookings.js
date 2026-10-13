import { getDb, initTables, verifyToken } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initTables();
    const sql = getDb();

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      if (!b.name || !b.service) {
        return res.status(400).json({ error: 'name and service required' });
      }
      const rows = await sql`
        INSERT INTO bookings (service, duration, date, time, name, phone, email, request, lang)
        VALUES (${b.service}, ${b.duration || null}, ${b.date || null}, ${b.time || null}, ${b.name},
                ${b.phone || null}, ${b.email || null}, ${b.request || null}, ${b.lang || null})
        RETURNING id
      `;
      return res.status(201).json({ id: rows[0].id });
    }

    if (req.method === 'GET') {
      const adminUser = verifyToken(req.headers.authorization);
      if (!adminUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200`;
      return res.status(200).json(rows);
    }

    if (req.method === 'DELETE') {
      const adminUser = verifyToken(req.headers.authorization);
      if (!adminUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.query || {};
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const bookingId = id || body.id;
      if (!bookingId) {
        return res.status(400).json({ error: 'id required' });
      }
      await sql`DELETE FROM bookings WHERE id = ${bookingId}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in bookings API:', err);
    return res.status(500).json({ error: err.message });
  }
}
