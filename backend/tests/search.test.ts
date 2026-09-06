import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Search API Endpoints', () => {
  const app = createApp();

  describe('GET /api/search Validation', () => {
    it('returns 400 Bad Request when "q" is missing', async () => {
      const res = await request(app).get('/api/search');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });

    it('returns 400 Bad Request when "q" is blank whitespace', async () => {
      const res = await request(app).get('/api/search?q=   ');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });

    it('returns 400 Bad Request when "q" exceeds 256 characters', async () => {
      const longQuery = 'a'.repeat(257);
      const res = await request(app).get(`/api/search?q=${longQuery}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });

    it('successfully processes valid search query', async () => {
      const res = await request(app).get('/api/search?q=linux+server+security');
      expect(res.status).toBe(200);
      expect(res.body.query).toBe('linux server security');
      expect(res.body.category).toBe('general');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);

      const item = res.body.results[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('url');
      expect(item).toHaveProperty('domain');
      expect(item).toHaveProperty('snippet');
      expect(item).toHaveProperty('engine');
    }, 15000);

    it('supports categories such as images and news', async () => {
      const imgRes = await request(app).get('/api/search?q=privacy&category=images');
      expect(imgRes.status).toBe(200);
      expect(imgRes.body.category).toBe('images');

      const newsRes = await request(app).get('/api/search?q=privacy&category=news');
      expect(newsRes.status).toBe(200);
      expect(newsRes.body.category).toBe('news');
    }, 15000);
  });

  describe('GET /api/suggestions', () => {
    it('returns suggestions for valid query prefix', async () => {
      const res = await request(app).get('/api/suggestions?q=linux');
      expect(res.status).toBe(200);
      expect(res.body.query).toBe('linux');
      expect(Array.isArray(res.body.suggestions)).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThan(0);
    });

    it('returns empty array when query is empty', async () => {
      const res = await request(app).get('/api/suggestions?q=');
      expect(res.status).toBe(200);
      expect(res.body.suggestions).toEqual([]);
    });
  });
});
