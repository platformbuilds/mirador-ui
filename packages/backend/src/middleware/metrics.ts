import type { NextFunction, Request, Response } from 'express';
import { Histogram, Counter, register } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Count of HTTP requests resulting in errors (5xx)',
  labelNames: ['method', 'route', 'status'],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const diffNs = Number(process.hrtime.bigint() - start);
    const seconds = diffNs / 1e9;
    const route = (req.route?.path || req.path || 'unknown').toString();
    const labels = { method: req.method, route, status: String(res.statusCode) } as const;
    httpRequestDuration.observe(labels, seconds);
    if (res.statusCode >= 500) httpRequestErrors.inc(labels);
  });
  next();
}

// ensure metrics are registered
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestErrors);

