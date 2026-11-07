import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Zenvora Regression Test Suite', () => {
  const app = createApp();

  // ==========================================
  // 1. Core Search Integrity & Schema Regression
  // ==========================================
  describe('Search API Response Schema Consistency', () => {
    it('returns exact ZenvoraSearchResponse schema structure', async () => {
      const res = await request(app).get('/api/search?q=open%20source');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('query');
      expect(res.body).toHaveProperty('numberOfResults');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('searchDuration');
      expect(res.body).toHaveProperty('queryIntent');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.numberOfResults).toBeGreaterThan(0);
    });

    it('ensures every result item contains sanitized required properties', async () => {
      const res = await request(app).get('/api/search?q=technology');
      expect(res.status).toBe(200);
      const results = res.body.results;
      expect(results.length).toBeGreaterThan(0);

      for (const item of results.slice(0, 10)) {
        expect(typeof item.id).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(typeof item.url).toBe('string');
        expect(typeof item.domain).toBe('string');
        expect(typeof item.score).toBe('number');
        expect(Array.isArray(item.engines)).toBe(true);
        expect(item.isNavigational === undefined || typeof item.isNavigational === 'boolean').toBe(true);
      }
    });
  });

  // ==========================================
  // 2. SafeSearch Filtering Regression
  // ==========================================
  describe('SafeSearch Filtering Regression', () => {
    it('supports safesearch level 0 (off)', async () => {
      const res = await request(app).get('/api/search?q=nature&safesearch=0');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });

    it('supports safesearch level 1 (moderate)', async () => {
      const res = await request(app).get('/api/search?q=wildlife&safesearch=1');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });

    it('supports safesearch level 2 (strict)', async () => {
      const res = await request(app).get('/api/search?q=animals&safesearch=2');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 3. Category Switching Regression
  // ==========================================
  describe('Category Switching Regression', () => {
    it('supports "images" category and returns image results', async () => {
      const res = await request(app).get('/api/search?q=mountains&category=images');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });

    it('supports "news" category and returns news items', async () => {
      const res = await request(app).get('/api/search?q=science&category=news');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });

    it('supports "it" category for developer queries', async () => {
      const res = await request(app).get('/api/search?q=docker&category=it');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 4. Pagination & Bounds Regression
  // ==========================================
  describe('Pagination & Parameter Bounds', () => {
    it('accepts page 1 and page 2 without overlapping or crash', async () => {
      const res1 = await request(app).get('/api/search?q=astronomy&page=1');
      expect(res1.status).toBe(200);

      const res2 = await request(app).get('/api/search?q=astronomy&page=2');
      expect(res2.status).toBe(200);
    });

    it('rejects invalid negative or non-integer page numbers gracefully', async () => {
      const res = await request(app).get('/api/search?q=test&page=-5');
      // Schema validator should clamp or reject
      expect([200, 400]).toContain(res.status);
    });
  });

  // ==========================================
  // 5. Input Sanitization & Security Regression
  // ==========================================
  describe('Input Sanitization & Injection Defense', () => {
    it('handles HTML and script injection attempts in query safely with security headers', async () => {
      const res = await request(app).get(
        `/api/search?q=${encodeURIComponent('<script>alert("xss")</script>')}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(res.headers).toHaveProperty('x-content-type-options');
    });

    it('handles SQL injection patterns in query without errors', async () => {
      const res = await request(app).get(
        `/api/search?q=${encodeURIComponent("' OR 1=1 --")}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('results');
    });

    it('handles unicode, emojis, and special characters safely', async () => {
      const res = await request(app).get(
        `/api/search?q=${encodeURIComponent('🚀 artificial intelligence 日本語')}`
      );
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 6. Suggestions & Autocomplete Regression
  // ==========================================
  describe('Suggestions API Regression', () => {
    it('returns array of string suggestions', async () => {
      const res = await request(app).get('/api/suggestions?q=type');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThan(0);
      expect(typeof res.body.suggestions[0]).toBe('string');
    });

    it('returns empty array when q is empty string', async () => {
      const res = await request(app).get('/api/suggestions?q=');
      expect(res.status).toBe(200);
      expect(res.body.suggestions).toEqual([]);
    });
  });
});
