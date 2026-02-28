import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Proxy endpoint for downloading files
  app.get('/api/download', async (req, res) => {
    const { url, filename } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentDisposition = `attachment; filename="${filename || 'download.m4a'}"`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);

      // Stream the response body to the client
      // @ts-ignore - response.body is a ReadableStream in Node 18+
      const reader = response.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
      
    } catch (error) {
      console.error('Download proxy error:', error);
      res.status(500).send('Failed to download file');
    }
  });

  if (process.env.NODE_ENV === 'production') {
    // Serve static files from the dist directory in production
    app.use(express.static(path.join(__dirname, 'dist')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
