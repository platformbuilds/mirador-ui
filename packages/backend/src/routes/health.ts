import type { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { register, collectDefaultMetrics } from 'prom-client';
import { config } from '../config.js';
import type { CacheService } from '../cache/CacheService.js';

collectDefaultMetrics();

export function healthRoutes(router: Router, deps?: { cache?: CacheService; prisma?: PrismaClient }) {
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: config.version, env: config.env });
  });

  router.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  router.get('/ready', async (_req, res) => {
    const checks: Record<string, any> = {};
    try {
      checks.redis = deps?.cache ? await deps.cache.ping() : 'skipped';
    } catch (e: any) {
      checks.redis = `error: ${e?.message || e}`;
    }
    try {
      if (deps?.prisma) {
        await deps.prisma.$queryRaw`SELECT 1`;
        checks.mysql = 'ok';
      } else checks.mysql = 'skipped';
    } catch (e: any) {
      checks.mysql = `error: ${e?.message || e}`;
    }
    const ok = Object.values(checks).every((v) => v === 'ok' || v === 'PONG' || v === 'skipped');
    res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'degraded', checks });
  });
}
