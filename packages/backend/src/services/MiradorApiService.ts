import axios from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../logger.js';
import { withCircuitBreaker } from '../utils/circuitBreaker.js';

export class MiradorApiService {
  private client = axios.create({
    baseURL: process.env.MIRADOR_CORE_URL || 'http://localhost:9000',
    timeout: 10000,
  });

  constructor() {
    axiosRetry(this.client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
    this.client.interceptors.response.use(
      (r) => r,
      (err) => {
        logger.error({ err }, 'MIRADOR-CORE request failed');
        return Promise.reject(err);
      },
    );
  }

  async health() {
    const { data } = await this.client.get('/health');
    return data;
  }

  // Logs
  async logsQuery(body: any) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.post('/api/v1/logs/query', body);
      return data;
    });
  }
  async logsFields() {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/logs/fields');
      return data;
    });
  }
  async logsStreams() {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/logs/streams');
      return data;
    });
  }

  // Metrics
  async labels() {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/labels');
      return data;
    });
  }
  async labelValues(name: string) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get(`/api/v1/label/${encodeURIComponent(name)}/values`);
      return data;
    });
  }
  async query(q: string) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/query', { params: { query: q } });
      return data;
    });
  }
  async queryRange(q: string, start: number, end: number, step: string) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/query_range', {
        params: { query: q, start, end, step },
      });
      return data;
    });
  }
  async series(match: string[], start?: number, end?: number) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/series', {
        params: { 'match[]': match, start, end },
      });
      return data;
    });
  }

  // Traces
  async traceServices() {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get('/api/v1/traces/services');
      return data;
    });
  }
  async traceOperations(service: string) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get(`/api/v1/traces/services/${encodeURIComponent(service)}/operations`);
      return data;
    });
  }
  async traceSearch(body: any) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.post('/api/v1/traces/search', body);
      return data;
    });
  }
  async traceById(traceId: string) {
    return withCircuitBreaker('mirador-core', async () => {
      const { data } = await this.client.get(`/api/v1/traces/${encodeURIComponent(traceId)}`);
      return data;
    });
  }
}
