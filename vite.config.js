import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'

// Load .env variables locally
if (fs.existsSync('.env')) {
  try {
    process.loadEnvFile('.env');
  } catch {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    for (const line of lines) {
      const [k, ...v] = line.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const route = urlObj.pathname.replace('/api/', '').split('?')[0];

          let handlerModule;
          if (route === 'reviews') handlerModule = await import('./api/reviews.js');
          else if (route === 'gallery') handlerModule = await import('./api/gallery.js');
          else if (route === 'auth') handlerModule = await import('./api/auth.js');
          else if (route === 'bookings') handlerModule = await import('./api/bookings.js');
          else if (route === 'upload') handlerModule = await import('./api/upload.js');

          if (!handlerModule?.default) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            req.query = Object.fromEntries(urlObj.searchParams);
            if (body) {
              try { req.body = JSON.parse(body); } catch { req.body = body; }
            }

            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            await handlerModule.default(req, res);
          });
        } catch (err) {
          console.error('API Error in dev server:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
})
