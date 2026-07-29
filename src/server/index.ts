import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { setupWebSocket } from './websocket';
import { apiRouter } from './api';

// Platform-Agnostic Data Directory Strategy
const DATA_DIR = process.env.SERVERPANEL_DATA_DIR || path.join(process.cwd(), 'data');

// Ensure essential sub-directories exist automatically (Idempotent)
const DIRS = {
  db: path.join(DATA_DIR, 'database'),
  logs: path.join(DATA_DIR, 'logs'),
  apps: path.join(DATA_DIR, 'apps'),
};

Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // Make core environment data available to APIs
  app.set('DATA_DIR', DATA_DIR);

  // API Routes
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer(app);
  
  // Setup WebSockets (Terminal, etc.)
  setupWebSocket(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Core] ServerPanel initializing...`);
    console.log(`[Core] Data Directory mapping: ${DATA_DIR}`);
    console.log(`[Core] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
