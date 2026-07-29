import { Router } from 'express';
import { getSystemMetrics, getOsInfo } from './adapters/system';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

apiRouter.get('/system/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

apiRouter.get('/system/info', async (req, res) => {
  try {
    const info = await getOsInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get OS info' });
  }
});

apiRouter.get('/apps', (req, res) => {
  // Mock app store for now
  res.json([
    { id: 'portainer', name: 'Portainer', description: 'Docker manager', icon: 'Box' },
    { id: 'jellyfin', name: 'Jellyfin', description: 'Media server', icon: 'Film' },
    { id: 'nextcloud', name: 'Nextcloud', description: 'Cloud storage', icon: 'Cloud' },
  ]);
});
