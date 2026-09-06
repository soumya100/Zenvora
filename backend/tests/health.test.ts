import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Health Endpoints', () => {
  const app = createApp();

  it('GET /health returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('zenvora-api');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  it('GET /api/health returns 200 with upstream SearXNG check structure', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('upstreamSearxng');
    expect(res.body.upstreamSearxng).toHaveProperty('reachable');
  });
});
