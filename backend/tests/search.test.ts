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

    it('accepts and applies language and region parameters', async () => {
      const regionRes = await request(app).get('/api/search?q=open+source&language=de&region=de');
      expect(regionRes.status).toBe(200);
      expect(regionRes.body.query).toBe('open source');
      expect(Array.isArray(regionRes.body.results)).toBe(true);
    }, 15000);

    it('returns official zenvora result and infobox for zenvora brand queries', async () => {
      const queries = ['zenvora', 'zenvora-beta', 'zenvora-beta vercel'];
      for (const q of queries) {
        const res = await request(app).get(`/api/search?q=${encodeURIComponent(q)}`);
        expect(res.status).toBe(200);
        expect(res.body.results.length).toBeGreaterThan(0);
        const hasOfficial = res.body.results.some((r: any) =>
          r.url.includes('zenvora-beta.vercel.app')
        );
        expect(hasOfficial).toBe(true);
        expect(res.body.infoboxes.length).toBeGreaterThan(0);
        expect(res.body.infoboxes[0].title).toContain('Zenvora');
      }
    }, 20000);

    it('returns accurate non-Wikipedia web results for website and tech queries', async () => {
      const testCases = [
        { q: 'youtube', expectedDomain: 'youtube.com' },
        { q: 'github', expectedDomain: 'github.com' },
        { q: 'react', expectedDomain: 'react.dev' },
      ];

      for (const tc of testCases) {
        const res = await request(app).get(`/api/search?q=${encodeURIComponent(tc.q)}`);
        expect(res.status).toBe(200);
        expect(res.body.results.length).toBeGreaterThan(0);

        // Top results must not be purely wikipedia
        const nonWikiResults = res.body.results.filter(
          (r: any) => !r.domain.includes('wikipedia.org')
        );
        expect(nonWikiResults.length).toBeGreaterThan(0);

        // Check that the expected official domain appears in the top results
        const hasExpectedDomain = res.body.results
          .slice(0, 5)
          .some((r: any) => r.domain.includes(tc.expectedDomain));
        expect(hasExpectedDomain).toBe(true);
      }
    }, 25000);

    it('resolves direct navigational intent when query is a domain URL', async () => {
      const res = await request(app).get('/api/search?q=openai.com');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.isNavigational).toBe(true);
      expect(topResult.domain).toBe('openai.com');
      expect(topResult.url).toContain('openai.com');
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

    it('returns branded suggestions for "zen" prefix', async () => {
      const res = await request(app).get('/api/suggestions?q=zen');
      expect(res.status).toBe(200);
      expect(res.body.suggestions).toContain('zenvora');
      expect(res.body.suggestions).toContain('zenvora-beta');
    });

    it('returns empty array when query is empty', async () => {
      const res = await request(app).get('/api/suggestions?q=');
      expect(res.status).toBe(200);
      expect(res.body.suggestions).toEqual([]);
    });
  });
});
