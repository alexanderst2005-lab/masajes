import { getDb, initTables, verifyToken } from './db.js';

export const DEFAULT_SERVICES = [
  {
    name_es: 'Masaje Relajante',
    name_en: 'Relaxing Massage',
    desc_es: 'Un masaje calmante enfocado en la relajación y el alivio del estrés.',
    desc_en: 'A calming massage focused on relaxation and stress relief.',
    image_url: '/relaxing.jpg',
    sort_order: 1,
    options: [
      { time: '60 Minutes', price: '$90 USD' },
      { time: '90 Minutes', price: '$130 USD' }
    ]
  },
  {
    name_es: 'Masaje en Pareja',
    name_en: 'Couple Massage',
    desc_es: 'Una experiencia de relajación compartida para dos, lado a lado.',
    desc_en: 'A shared relaxation experience for two, side by side.',
    image_url: '/couple.png',
    sort_order: 2,
    options: [
      { time: '60 Minutes', price: '$180 USD' },
      { time: '90 Minutes', price: '$260 USD' }
    ]
  },
  {
    name_es: 'Masaje de Tejido Profundo',
    name_en: 'Deep Tissue Massage',
    desc_es: 'Presión enfocada para ayudar a liberar la tensión muscular.',
    desc_en: 'Focused pressure to help release muscle tension and tightness.',
    image_url: '/deeptissue.jpg',
    sort_order: 3,
    options: [
      { time: '60 Minutes', price: '$135 USD' },
      { time: '90 Minutes', price: '$155 USD' }
    ]
  },
  {
    name_es: 'Masajes Grupales',
    name_en: 'Group Massages',
    desc_es: 'Para grupos de tres o más personas, se aplica un 5% de descuento por persona; los masajes comienzan en $85.00.',
    desc_en: 'For groups of three or more people, a 5% discount per person applies; massages start at $85.00.',
    image_url: '/group.jpg',
    sort_order: 4,
    options: [
      { time: 'Por persona', price: 'Desde $85 USD' }
    ]
  },
  {
    name_es: 'Masaje para Embarazadas',
    name_en: 'Pregnant Women',
    desc_es: 'Técnicas suaves diseñadas especialmente para futuras madres.',
    desc_en: 'Gentle, soothing techniques designed specifically for expecting mothers.',
    image_url: '/prenatal.jpg',
    sort_order: 5,
    options: [
      { time: '60 Minutes', price: '$100 USD' },
      { time: '90 Minutes', price: '$125 USD' }
    ]
  },
  {
    name_es: 'Masaje en Yate',
    name_en: 'Yacht Massage',
    desc_es: 'Una experiencia de masaje de lujo a bordo de tu yate. Relajación pura en el agua.',
    desc_en: 'A luxurious massage experience aboard your yacht. Pure relaxation on the water.',
    image_url: '/yacht.png',
    sort_order: 6,
    options: [
      { time: '60 Minutes', price: '$100 USD' }
    ]
  }
];

// Helper to auto-translate English text into Spanish automatically
async function autoTranslateToSpanish(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' + encodeURIComponent(trimmed);
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.[0])) {
        const translated = data[0].map(s => s?.[0] || '').join('').trim();
        if (translated) return translated;
      }
    }
  } catch (err) {
    console.warn('Auto translation warning, using fallback:', err.message);
  }
  return trimmed;
}

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

    // GET: public list of services (auto-seeds defaults if table is empty)
    if (req.method === 'GET') {
      let items = await sql`
        SELECT * FROM services ORDER BY sort_order ASC, id ASC;
      `;

      if (items.length === 0) {
        for (const s of DEFAULT_SERVICES) {
          await sql`
            INSERT INTO services (name_es, name_en, desc_es, desc_en, options, image_url, sort_order)
            VALUES (${s.name_es},
                    ${s.name_en},
                    ${s.desc_es},
                    ${s.desc_en},
                    ${JSON.stringify(cleanOptions(s.options))}::jsonb,
                    ${s.image_url},
                    ${s.sort_order});
          `;
        }
        items = await sql`
          SELECT * FROM services ORDER BY sort_order ASC, id ASC;
        `;
      }

      return res.status(200).json(items);
    }

    // All other operations require admin authorization
    const adminUser = verifyToken(req.headers.authorization);
    if (!adminUser) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // POST: create service or seed defaults
    if (req.method === 'POST') {
      const body = readBody(req);

      if (body.action === 'seed_defaults') {
        for (const s of DEFAULT_SERVICES) {
          await sql`
            INSERT INTO services (name_es, name_en, desc_es, desc_en, options, image_url, sort_order)
            VALUES (${s.name_es},
                    ${s.name_en},
                    ${s.desc_es},
                    ${s.desc_en},
                    ${JSON.stringify(cleanOptions(s.options))}::jsonb,
                    ${s.image_url},
                    ${s.sort_order});
          `;
        }
        const items = await sql`
          SELECT * FROM services ORDER BY sort_order ASC, id ASC;
        `;
        return res.status(200).json({ ok: true, items });
      }

      const { name, name_en, name_es, desc, desc_en, desc_es, options, image_url } = body;

      const finalNameEn = cleanText(name_en || name);
      if (!finalNameEn && !cleanText(name_es)) {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }

      // Auto-translate to Spanish if not specifically provided
      const finalNameEs = cleanText(name_es) || (await autoTranslateToSpanish(finalNameEn));
      const finalDescEn = cleanText(desc_en || desc);
      const finalDescEs = cleanText(desc_es) || (finalDescEn ? await autoTranslateToSpanish(finalDescEn) : null);
      const finalImageUrl = cleanText(image_url);

      const rows = await sql`
        INSERT INTO services (name_es, name_en, desc_es, desc_en, options, image_url)
        VALUES (${finalNameEs},
                ${finalNameEn || finalNameEs},
                ${finalDescEs},
                ${finalDescEn},
                ${JSON.stringify(cleanOptions(options))}::jsonb,
                ${finalImageUrl})
        RETURNING *;
      `;
      return res.status(201).json({ ok: true, item: rows[0] });
    }

    // PUT: update service
    if (req.method === 'PUT') {
      const body = readBody(req);
      const { id, name, name_en, name_es, desc, desc_en, desc_es, options, image_url } = body;

      if (!id) {
        return res.status(400).json({ error: 'Se requiere el id del servicio' });
      }

      const finalNameEn = cleanText(name_en || name);
      if (!finalNameEn && !cleanText(name_es)) {
        return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
      }

      // Auto-translate to Spanish if not specifically provided
      const finalNameEs = cleanText(name_es) || (await autoTranslateToSpanish(finalNameEn));
      const finalDescEn = cleanText(desc_en || desc);
      const finalDescEs = cleanText(desc_es) || (finalDescEn ? await autoTranslateToSpanish(finalDescEn) : null);
      const finalImageUrl = cleanText(image_url);

      const rows = await sql`
        UPDATE services
        SET name_es = ${finalNameEs},
            name_en = ${finalNameEn || finalNameEs},
            desc_es = ${finalDescEs},
            desc_en = ${finalDescEn},
            options = ${JSON.stringify(cleanOptions(options))}::jsonb,
            image_url = ${finalImageUrl}
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
