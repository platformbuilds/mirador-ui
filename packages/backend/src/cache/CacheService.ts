import Redis from 'ioredis';
import { logger } from '../logger.js';
import { config } from '../config.js';

export class CacheService {
  private client: Redis;

  constructor() {
    if (config.redis.url) {
      this.client = new Redis(config.redis.url, { lazyConnect: true, maxRetriesPerRequest: 3 });
    } else {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      });
    }

    this.client.on('error', (err) => logger.error({ err }, 'Redis error'));
    this.client.on('connect', () => logger.info('Redis connected'));
    this.client.on('reconnecting', () => logger.warn('Redis reconnecting'));
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      logger.error({ err }, 'Failed to connect to Redis');
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    return val ? (JSON.parse(val) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) await this.client.setex(key, ttlSeconds, payload);
    else await this.client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}
