import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

let sqlClient = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

// Ensures tables are created
export async function initTables() {
  const sql = getDb();
  
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      is_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      media_type TEXT NOT NULL DEFAULT 'image',
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      service TEXT NOT NULL,
      duration TEXT,
      date TEXT,
      time TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      request TEXT,
      lang TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

// Secure token generation & verification using HMAC-SHA256
const SECRET = process.env.ADMIN_TOKEN || 'sxm_massage_secure_secret_2026';

export function createToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }); // 7 days
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // Also support direct match with ADMIN_TOKEN for raw API calls
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
    return { user: 'admin', role: 'admin' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;

  const expectedSig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
  if (expectedSig !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}
