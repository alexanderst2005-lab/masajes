import { verifyToken, createToken, initTables } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initTables();

    // Verify current session
    if (req.method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      if (!user) {
        return res.status(401).json({ error: 'No autorizado o sesión expirada' });
      }
      return res.status(200).json({ ok: true, user });
    }

    // Login
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { username, password } = body;

      const validUser = (process.env.ADMIN_EMAIL || process.env.ADMIN_USER || 'admin').toLowerCase().trim();
      const validPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || 'admin123').trim();

      const inputUser = (username || '').toLowerCase().trim();
      const inputPass = (password || '').trim();

      // Check credentials (allows matching by username, email or standard admin)
      const userMatches = inputUser === validUser || 
                          inputUser === 'admin' || 
                          inputUser === 'theartofrelaxation.sxm@gmail.com';
      const passMatches = inputPass === validPass;

      if (!userMatches || !passMatches) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      const token = createToken({ user: inputUser, role: 'admin' });
      return res.status(200).json({
        ok: true,
        token,
        user: { name: 'The Art of Relaxation Sxm', role: 'admin' }
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in auth handler:', error);
    return res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
}
