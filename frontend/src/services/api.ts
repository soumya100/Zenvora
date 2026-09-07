import { SearchCategory, SearchResponse } from '../types';

const API_BASE = '/api';

export interface SearchParams {
  q: string;
  category?: SearchCategory;
  page?: number;
  safesearch?: number;
  language?: string;
  region?: string;
  timeRange?: string;
}

export class SearchApiService {
  async search(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse> {
    const url = new URL(`${API_BASE}/search`, window.location.origin);
    url.searchParams.set('q', params.q);
    if (params.category) url.searchParams.set('category', params.category);
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.safesearch !== undefined) url.searchParams.set('safesearch', params.safesearch.toString());
    if (params.language && params.language !== 'auto') url.searchParams.set('language', params.language);
    if (params.region && params.region !== 'auto') url.searchParams.set('region', params.region);
    if (params.timeRange) url.searchParams.set('timeRange', params.timeRange);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      let errorMessage = 'Search temporarily unavailable. Please try again.';
      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  async getSuggestions(query: string, signal?: AbortSignal): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      const url = new URL(`${API_BASE}/suggestions`, window.location.origin);
      url.searchParams.set('q', query.trim());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!response.ok) return [];

      const data = await response.json();
      return Array.isArray(data.suggestions) ? data.suggestions : [];
    } catch {
      return [];
    }
  }

  async checkHealth(): Promise<{ status: string; upstreamSearxng?: { reachable: boolean } }> {
    try {
      const res = await fetch('/health');
      if (!res.ok) return { status: 'error' };
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  }
}

export const searchApi = new SearchApiService();
