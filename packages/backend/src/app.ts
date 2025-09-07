import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config.js';
import { logger } from './logger.js';
import { healthRoutes } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { CacheService } from './cache/CacheService.js';
import { openApiSpec } from './openapi.js';
import { authRoutes } from './routes/auth.js';
import { miradorRoutes } from './routes/mirador.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { timelineRoutes } from './routes/timeline.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { analyticsRoutes } from './routes/analytics.js';

export async function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: config.env === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    } : false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  }));
  app.use(cors({ origin: config.corsOrigin }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max }));
  app.use(metricsMiddleware);

  app.use(pinoHttp({ logger }));
  if (config.env !== 'production') app.use(morgan('dev'));

  const cache = new CacheService();
  await cache.connect();

  const router = express.Router();
  // Health and readiness routes with dependencies
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { prisma } = await import('./db/prisma.js');
  healthRoutes(router, { cache, prisma });
  authRoutes(router);
  miradorRoutes(router, cache);
  dashboardRoutes(router);
  timelineRoutes(router);
  analyticsRoutes(router);
  app.use('/api', router);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(errorHandler);

  return app;
}
