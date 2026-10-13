import { getDb, initTables, verifyToken } from './db.js';

// In-memory simple rate limiting per IP or token for POST
const recentPosts = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initTables();
    const sql = getDb();
    const adminUser = verifyToken(req.headers.authorization);

    // GET: List reviews
    if (req.method === 'GET') {
      let rows;
      if (adminUser) {
        // Admin sees all (including hidden) ordered by date descending
        rows = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      } else {
        // Public sees only visible reviews
        rows = await sql`SELECT id, name, rating, comment, created_at FROM reviews WHERE is_visible = TRUE ORDER BY created_at DESC`;
      }
      return res.status(200).json(rows);
    }

    // POST: Public submission of a new review
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { name, rating, comment, honeypot } = body;

      // 1. Anti-spam honeypot
      if (honeypot && String(honeypot).trim() !== '') {
        return res.status(400).json({ error: 'Envío no válido' });
      }

      // 2. Anti-spam basic IP/client rate limit (1 submission per 15s per client)
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'client';
      const now = Date.now();
      const lastTime = recentPosts.get(clientIp) || 0;
      if (now - lastTime < 15000) {
        return res.status(429).json({ error: 'Por favor espera unos segundos antes de enviar otra reseña.' });
      }
      recentPosts.set(clientIp, now);

      // Clean old map entries
      if (recentPosts.size > 1000) {
        for (const [key, time] of recentPosts.entries()) {
          if (now - time > 60000) recentPosts.delete(key);
        }
      }

      // 3. Validation
      const cleanName = (name || '').trim();
      const cleanComment = (comment || '').trim();
      const numRating = parseInt(rating, 10);

      if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 80 caracteres.' });
      }
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'La calificación debe ser de 1 a 5 estrellas.' });
      }
      if (!cleanComment || cleanComment.length < 4 || cleanComment.length > 1200) {
        return res.status(400).json({ error: 'El comentario debe tener entre 4 y 1200 caracteres.' });
      }

      // Insert and auto-publish (is_visible = TRUE)
      const rows = await sql`
        INSERT INTO reviews (name, rating, comment, is_visible)
        VALUES (${cleanName}, ${numRating}, ${cleanComment}, TRUE)
        RETURNING id, name, rating, comment, created_at, is_visible;
      `;

      return res.status(201).json({
        ok: true,
        message: 'Reseña publicada con éxito',
        review: rows[0]
      });
    }

    // PATCH: Admin toggle visibility (hide/show)
    if (req.method === 'PATCH') {
      if (!adminUser) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { id, is_visible } = body;

      if (!id || typeof is_visible !== 'boolean') {
        return res.status(400).json({ error: 'Se requieren id y el nuevo estado is_visible' });
      }

      const rows = await sql`
        UPDATE reviews
        SET is_visible = ${is_visible}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }

      return res.status(200).json({ ok: true, review: rows[0] });
    }

    // DELETE: Admin delete review
    if (req.method === 'DELETE') {
      if (!adminUser) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
      }

      const { id } = req.query || {};
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const reviewId = id || body.id;

      if (!reviewId) {
        return res.status(400).json({ error: 'Se requiere el id de la reseña' });
      }

      await sql`DELETE FROM reviews WHERE id = ${reviewId};`;
      return res.status(200).json({ ok: true, message: 'Reseña eliminada correctamente' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in reviews handler:', error);
    return res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
}
