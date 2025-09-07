import type { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { MiradorApiService } from '../services/MiradorApiService.js';
import { CacheService } from '../cache/CacheService.js';

const api = new MiradorApiService();

function key(path: string, params?: any, body?: any) {
  return `mirador:${path}:${params ? JSON.stringify(params) : ''}:${body ? JSON.stringify(body) : ''}`;
}

export function miradorRoutes(router: Router, cache?: CacheService) {
  // Logs
  router.post('/mirador/logs/query', validate(z.object({ body: z.any() })), async (req, res, next) => {
    try {
      const k = key('logs/query', undefined, req.body);
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.logsQuery(req.body);
      if (cache) await cache.set(k, data, 30);
      res.json(data);
    } catch (e) { next(e); }
  });
  router.get('/mirador/logs/fields', async (_req, res, next) => {
    try { res.json(await api.logsFields()); } catch (e) { next(e); }
  });
  router.get('/mirador/logs/streams', async (_req, res, next) => {
    try { res.json(await api.logsStreams()); } catch (e) { next(e); }
  });

  // Metrics
  router.get('/mirador/labels', async (_req, res, next) => {
    try {
      const k = key('labels');
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.labels();
      if (cache) await cache.set(k, data, 3600);
      res.json(data);
    } catch (e) { next(e); }
  });
  router.get('/mirador/label/:name/values', async (req, res, next) => {
    try {
      const k = key('label/values', req.params);
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.labelValues(req.params.name);
      if (cache) await cache.set(k, data, 3600);
      res.json(data);
    } catch (e) { next(e); }
  });
  router.get('/mirador/query', async (req, res, next) => {
    try {
      const q = String(req.query.query || '');
      const k = key('query', { q });
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.query(q);
      if (cache) await cache.set(k, data, 30);
      res.json(data);
    } catch (e) { next(e); }
  });
  router.get('/mirador/query_range', async (req, res, next) => {
    try {
      const { query, start, end, step } = req.query as any;
      const k = key('query_range', { query, start, end, step });
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.queryRange(String(query), Number(start), Number(end), String(step));
      if (cache) await cache.set(k, data, 30);
      res.json(data);
    } catch (e) { next(e); }
  });
  router.get('/mirador/series', async (req, res, next) => {
    try {
      const matches = ([] as string[]).concat((req.query['match[]'] as any) || []);
      const { start, end } = req.query as any;
      const k = key('series', { matches, start, end });
      const cached = cache && (await cache.get(k));
      if (cached) return res.json(cached);
      const data = await api.series(matches, start ? Number(start) : undefined, end ? Number(end) : undefined);
      if (cache) await cache.set(k, data, 300);
      res.json(data);
    } catch (e) { next(e); }
  });

  // Traces
  router.get('/mirador/traces/services', async (_req, res, next) => {
    try { res.json(await api.traceServices()); } catch (e) { next(e); }
  });
  router.get('/mirador/traces/services/:service/operations', async (req, res, next) => {
    try { res.json(await api.traceOperations(req.params.service)); } catch (e) { next(e); }
  });
  router.post('/mirador/traces/search', validate(z.object({ body: z.any() })), async (req, res, next) => {
    try { res.json(await api.traceSearch(req.body)); } catch (e) { next(e); }
  });
  router.get('/mirador/traces/:traceId', async (req, res, next) => {
    try { res.json(await api.traceById(req.params.traceId)); } catch (e) { next(e); }
  });
}
