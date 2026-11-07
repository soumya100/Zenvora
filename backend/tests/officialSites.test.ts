import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { findKnownOfficialSite, KNOWN_OFFICIAL_SITES } from '../src/services/officialSites.service';

describe('Official Sites & Navigational Intelligence', () => {
  const app = createApp();

  describe('findKnownOfficialSite Knowledge Base Lookup', () => {
    it('accurately resolves official technology and framework sites', () => {
      const react = findKnownOfficialSite('react');
      expect(react).toBeDefined();
      expect(react?.domain).toBe('react.dev');
      expect(react?.url).toBe('https://react.dev/');

      const tailwind = findKnownOfficialSite('tailwindcss');
      expect(tailwind).toBeDefined();
      expect(tailwind?.domain).toBe('tailwindcss.com');

      const nextjs = findKnownOfficialSite('next.js');
      expect(nextjs).toBeDefined();
      expect(nextjs?.domain).toBe('nextjs.org');

      const vue = findKnownOfficialSite('vue');
      expect(vue).toBeDefined();
      expect(vue?.domain).toBe('vuejs.org');

      const vite = findKnownOfficialSite('vite');
      expect(vite).toBeDefined();
      expect(vite?.domain).toBe('vite.dev');
    });

    it('handles query variants and navigational modifiers', () => {
      expect(findKnownOfficialSite('reactjs')?.domain).toBe('react.dev');
      expect(findKnownOfficialSite('react js')?.domain).toBe('react.dev');
      expect(findKnownOfficialSite('react official site')?.domain).toBe('react.dev');
      expect(findKnownOfficialSite('react website')?.domain).toBe('react.dev');
      expect(findKnownOfficialSite('tailwind css official website')?.domain).toBe('tailwindcss.com');
      expect(findKnownOfficialSite('spotify login')?.domain).toBe('spotify.com');
      expect(findKnownOfficialSite('python official site')?.domain).toBe('python.org');
      expect(findKnownOfficialSite('github website')?.domain).toBe('github.com');
    });

    it('resolves consumer and web services', () => {
      expect(findKnownOfficialSite('spotify')?.domain).toBe('spotify.com');
      expect(findKnownOfficialSite('netflix')?.domain).toBe('netflix.com');
      expect(findKnownOfficialSite('youtube')?.domain).toBe('youtube.com');
      expect(findKnownOfficialSite('figma')?.domain).toBe('figma.com');
      expect(findKnownOfficialSite('notion')?.domain).toBe('notion.so');
      expect(findKnownOfficialSite('chatgpt')?.domain).toBe('chatgpt.com');
      expect(findKnownOfficialSite('claude')?.domain).toBe('claude.ai');
    });

    it('does not trigger for comparison, educational, or problem queries', () => {
      expect(findKnownOfficialSite('react vs vue')).toBeNull();
      expect(findKnownOfficialSite('how to install python')).toBeNull();
      expect(findKnownOfficialSite('difference between nextjs and remix')).toBeNull();
      expect(findKnownOfficialSite('react state management tutorial')).toBeNull();
      expect(findKnownOfficialSite('albert einstein')).toBeNull();
      expect(findKnownOfficialSite('elon musk')).toBeNull();
    });

    it('has over 40 curated official site configurations', () => {
      expect(KNOWN_OFFICIAL_SITES.length).toBeGreaterThan(40);
    });
  });

  describe('GET /api/search Official Site Ranking (Rank #1)', () => {
    it('places react.dev at Rank #1 with isNavigational=true for "react"', async () => {
      const res = await request(app).get('/api/search?q=react');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('react.dev');
      expect(topResult.url).toBe('https://react.dev/');
      expect(topResult.isNavigational).toBe(true);

      // Verify no internal duckduckgo redirect topics exist
      const hasDdgInternal = res.body.results.some((r: any) =>
        r.domain.includes('duckduckgo.com')
      );
      expect(hasDdgInternal).toBe(false);
    }, 20000);

    it('places tailwindcss.com at Rank #1 for "tailwindcss"', async () => {
      const res = await request(app).get('/api/search?q=tailwindcss');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('tailwindcss.com');
      expect(topResult.url).toBe('https://tailwindcss.com/');
      expect(topResult.isNavigational).toBe(true);
    }, 20000);

    it('places spotify.com at Rank #1 for "spotify"', async () => {
      const res = await request(app).get('/api/search?q=spotify');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('spotify.com');
      expect(topResult.isNavigational).toBe(true);
    }, 20000);

    it('places python.org at Rank #1 for "python"', async () => {
      const res = await request(app).get('/api/search?q=python');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('python.org');
      expect(topResult.url).toBe('https://www.python.org/');
      expect(topResult.isNavigational).toBe(true);
    }, 20000);

    it('places github.com at Rank #1 for "github"', async () => {
      const res = await request(app).get('/api/search?q=github');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('github.com');
      expect(topResult.url).toBe('https://github.com/');
      expect(topResult.isNavigational).toBe(true);
    }, 20000);

    it('places youtube.com at Rank #1 for "youtube"', async () => {
      const res = await request(app).get('/api/search?q=youtube');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      const topResult = res.body.results[0];
      expect(topResult.domain).toBe('youtube.com');
      expect(topResult.isNavigational).toBe(true);
    }, 20000);

    it('preserves biographical knowledge card and Wikipedia for person query', async () => {
      const res = await request(app).get('/api/search?q=Albert+Einstein');
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.infoboxes.length).toBeGreaterThan(0);
      expect(res.body.infoboxes[0].title).toContain('Einstein');

      const hasWiki = res.body.results.some((r: any) => r.domain.includes('wikipedia.org'));
      expect(hasWiki).toBe(true);
    }, 20000);
  });
});

