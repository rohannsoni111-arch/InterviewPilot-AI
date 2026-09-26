import request from 'supertest';
import { createApp } from '../src/app';

describe('Health Check API', () => {
  const app = createApp();

  it('GET /api/v1/health should return 200 with system status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.version).toBe('1.0.0');
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.services).toBeDefined();
  });

  it('GET /api/v1/non-existing should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existing');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
