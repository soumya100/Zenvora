import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Zenvora Smoke Tests (Critical System Health & Key Paths)', () => {
  const app = createApp();

  it('SMOKE 1: Basic Health endpoint /health responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('zenvora-api');
  });

  it('SMOKE 2: API Health endpoint /api/health responds ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('upstreamSearxng');
  });

  it('SMOKE 3: Web Search Endpoint /api/search returns results quickly', async () => {
    const res = await request(app).get('/api/search?q=zenvora');
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
  }, 10000);

  it('SMOKE 4: Autocomplete Suggestions Endpoint /api/suggestions responds', async () => {
    const res = await request(app).get('/api/suggestions?q=zen');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it('SMOKE 5: AI Overview Endpoint /api/ai/overview responds with structured payload', async () => {
    const res = await request(app)
      .post('/api/ai/overview')
      .send({
        query: 'what is zenvora',
        searchResults: [
          {
            title: 'Zenvora Search',
            url: 'https://zenvora.org',
            domain: 'zenvora.org',
            snippet: 'Zenvora is an open private metasearch engine.',
          },
        ],
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  }, 10000);

  it('SMOKE 6: SSRF Defense blocks malicious loopback in image proxy', async () => {
    const res = await request(app).get('/api/image-proxy?url=http://127.0.0.1:8080/secret');
    expect([400, 403]).toContain(res.status);
  });

  it('SMOKE 7: Instant Answer calculation responds with result', async () => {
    const res = await request(app).get('/api/search?q=50%20*%2050');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('directAnswer');
    expect(res.body.directAnswer?.answer).toBe('2500');
  }, 10000);
});
