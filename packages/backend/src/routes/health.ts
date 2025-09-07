import type { Router } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';
import { config } from '../config.js';

collectDefaultMetrics();

export function healthRoutes(router: Router) {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: config.version, env: config.env });
  });

  router.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

