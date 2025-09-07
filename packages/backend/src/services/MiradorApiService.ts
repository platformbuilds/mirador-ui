import axios from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../logger.js';

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
}

