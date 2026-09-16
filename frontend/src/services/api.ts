import {
  SearchCategory,
  SearchResponse,
  SearchResultItem,
  AiOverviewResponse,
  AiOverviewSource,
  AiOverviewChatRequest,
  AiOverviewChatResponse,
} from '../types';

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

  async getAiOverview(
    query: string,
    searchResults?: SearchResultItem[],
    signal?: AbortSignal
  ): Promise<AiOverviewResponse> {
    const cleanQ = query.trim();
    if (!cleanQ) {
      return { query: '', answer: '', sources: [], status: 'error' };
    }

    const payload: any = {
      query: cleanQ,
      stream: false,
    };

    if (searchResults && searchResults.length > 0) {
      payload.searchResults = searchResults.slice(0, 10).map((r) => ({
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
      }));
    }

    const res = await fetch(`${API_BASE}/ai/overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      let msg = 'Failed to generate AI Overview.';
      try {
        const err = await res.json();
        if (err?.error?.message) msg = err.error.message;
      } catch {}
      throw new Error(msg);
    }

    return await res.json();
  }

  async streamAiOverview(
    query: string,
    searchResults: SearchResultItem[] | undefined,
    callbacks: {
      onSources?: (sources: AiOverviewSource[], status: string) => void;
      onDelta?: (delta: string, accumulated: string) => void;
      onDone?: (data: AiOverviewResponse) => void;
      onError?: (err: Error) => void;
    },
    signal?: AbortSignal
  ): Promise<void> {
    const cleanQ = query.trim();
    if (!cleanQ) return;

    const payload: any = {
      query: cleanQ,
      stream: true,
    };

    if (searchResults && searchResults.length > 0) {
      payload.searchResults = searchResults.slice(0, 10).map((r) => ({
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
      }));
    }

    try {
      const res = await fetch(`${API_BASE}/ai/overview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok || !res.body) {
        // Fallback to standard fetch
        const data = await this.getAiOverview(query, searchResults, signal);
        callbacks.onSources?.(data.sources, data.status);
        callbacks.onDelta?.(data.answer, data.answer);
        callbacks.onDone?.(data);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'sources') {
              callbacks.onSources?.(parsed.sources || [], parsed.status || 'success');
            } else if (parsed.type === 'delta') {
              callbacks.onDelta?.(parsed.delta, parsed.accumulated);
            } else if (parsed.type === 'done') {
              callbacks.onDone?.({
                query: parsed.query || cleanQ,
                answer: parsed.answer || '',
                sources: parsed.sources || [],
                status: parsed.status || 'success',
              });
            } else if (parsed.error) {
              throw new Error(parsed.error.message || 'Stream error occurred.');
            }
          } catch (e) {
            // Ignore malformed intermediate chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      callbacks.onError?.(err);
    }
  }

  async sendAiOverviewChat(
    payload: AiOverviewChatRequest,
    signal?: AbortSignal
  ): Promise<AiOverviewChatResponse> {
    const res = await fetch(`${API_BASE}/ai/overview/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Follow-up failed with status ${res.status}`);
    }

    return await res.json();
  }

  async streamAiOverviewChat(
    payload: AiOverviewChatRequest,
    callbacks: {
      onSources?: (sources: AiOverviewSource[]) => void;
      onDelta?: (delta: string, accumulated: string) => void;
      onDone?: (data: AiOverviewChatResponse) => void;
      onError?: (err: Error) => void;
    },
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/ai/overview/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ ...payload, stream: true }),
        signal,
      });

      if (!res.ok || !res.body) {
        // Fallback to JSON fetch
        const data = await this.sendAiOverviewChat(payload, signal);
        callbacks.onSources?.(data.sources);
        callbacks.onDelta?.(data.reply, data.reply);
        callbacks.onDone?.(data);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'sources') {
              callbacks.onSources?.(parsed.sources || []);
            } else if (parsed.type === 'delta') {
              callbacks.onDelta?.(parsed.delta, parsed.accumulated);
            } else if (parsed.type === 'done') {
              callbacks.onDone?.({
                reply: parsed.reply || '',
                sources: parsed.sources || [],
                status: parsed.status,
              });
            } else if (parsed.error) {
              throw new Error(parsed.error.message || 'Stream error occurred.');
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      callbacks.onError?.(err);
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
