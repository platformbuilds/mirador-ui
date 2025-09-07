import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health', () => {
  it('returns ok', async () => {
    const app = await createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

