import 'dotenv/config';

export type AppConfig = {
  env: string;
  port: number;
  version: string;
  corsOrigin: string | RegExp | (string | RegExp)[];
  redis: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
  };
  mysqlUrl?: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
};

const getEnv = (key: string, fallback?: string) => process.env[key] ?? fallback;

export const config: AppConfig = {
  env: getEnv('NODE_ENV', 'development')!,
  port: Number(getEnv('PORT', '8080')),
  version: getEnv('APP_VERSION', '0.1.0')!,
  corsOrigin: getEnv('CORS_ORIGIN', '*')!,
  redis: {
    url: getEnv('REDIS_URL'),
    host: getEnv('REDIS_HOST'),
    port: getEnv('REDIS_PORT') ? Number(getEnv('REDIS_PORT')) : undefined,
    password: getEnv('REDIS_PASSWORD'),
  },
  mysqlUrl: getEnv('DATABASE_URL'),
  rateLimit: {
    windowMs: Number(getEnv('RATE_LIMIT_WINDOW_MS', '60000')),
    max: Number(getEnv('RATE_LIMIT_MAX', '1000')),
  },
};

