import axios from 'axios';
import { config } from '../config/env';

interface SuggestionCacheEntry {
  suggestions: string[];
  expiresAt: number;
}

const suggestionCache = new Map<string, SuggestionCacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class SuggestionService {
  public async getSuggestions(query: string): Promise<string[]> {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return [];

    // 1. Check in-memory cache
    const cached = suggestionCache.get(cleanQ);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.suggestions;
    }

    let results: string[] = [];

    // 2. Try upstream SearXNG autocomplete
    if (!config.mockSearch) {
      try {
        const response = await axios.get(`${config.searxngUrl}/autocompleter`, {
          params: { q: cleanQ },
          timeout: 1500,
          headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
        });

        if (Array.isArray(response.data)) {
          if (Array.isArray(response.data[1])) {
            results = response.data[1].map((s: any) => String(s)).filter(Boolean);
          } else {
            results = response.data.map((s: any) => String(s)).filter(Boolean);
          }
        }
      } catch {
        // Upstream unavailable, fallback to real open suggestion providers
      }
    }

    // 3. Try DuckDuckGo Autocomplete API
    if (results.length === 0) {
      try {
        const ddgRes = await axios.get('https://duckduckgo.com/ac/', {
          params: { q: cleanQ, type: 'list' },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 2000,
        });

        if (Array.isArray(ddgRes.data) && Array.isArray(ddgRes.data[1])) {
          results = ddgRes.data[1]
            .map((s: any) => (typeof s === 'string' ? s : s?.phrase || ''))
            .filter(Boolean);
        }
      } catch {
        // Fall through
      }
    }

    // 4. Try Google Public Autocomplete API
    if (results.length === 0) {
      try {
        const googleRes = await axios.get('https://suggestqueries.google.com/complete/search', {
          params: { client: 'firefox', q: cleanQ },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 2000,
        });

        if (Array.isArray(googleRes.data) && Array.isArray(googleRes.data[1])) {
          results = googleRes.data[1].map((s: any) => String(s)).filter(Boolean);
        }
      } catch {
        // Fall through
      }
    }

    // 5. Try Wikipedia OpenSearch API
    if (results.length === 0) {
      try {
        const wikiRes = await axios.get('https://en.wikipedia.org/w/api.php', {
          params: { action: 'opensearch', search: cleanQ, limit: 8, namespace: 0, format: 'json' },
          headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
          timeout: 2000,
        });

        if (Array.isArray(wikiRes.data) && Array.isArray(wikiRes.data[1])) {
          results = wikiRes.data[1].map((s: any) => String(s)).filter(Boolean);
        }
      } catch {
        // Fall through
      }
    }

    // Deduplicate and filter suggestions
    const unique = Array.from(new Set(results.map((s) => s.trim()))).filter(Boolean);
    const finalSuggestions = unique.slice(0, 7);

    // Cache the result
    suggestionCache.set(cleanQ, {
      suggestions: finalSuggestions,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    if (suggestionCache.size > 2000) {
      const oldestKey = suggestionCache.keys().next().value;
      if (oldestKey) suggestionCache.delete(oldestKey);
    }

    return finalSuggestions;
  }
}

export const suggestionService = new SuggestionService();

