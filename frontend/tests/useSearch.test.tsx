import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../src/hooks/useSearch';
import { searchApi } from '../src/services/api';
import { SearchResponse } from '../src/types';

describe('useSearch Hook & Tab Switching Behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockGeneralResponse: SearchResponse = {
    query: 'iron man',
    category: 'general',
    page: 1,
    numberOfResults: 100,
    searchDuration: 0.25,
    results: [
      {
        id: '1',
        title: 'Iron Man General Result',
        url: 'https://marvel.com/ironman',
        domain: 'marvel.com',
        snippet: 'General overview',
        engine: 'duckduckgo',
        engines: ['duckduckgo'],
        category: 'general',
      },
    ],
  };

  const mockImagesResponse: SearchResponse = {
    query: 'iron man',
    category: 'images',
    page: 1,
    numberOfResults: 50,
    searchDuration: 0.18,
    results: [
      {
        id: '2',
        title: 'Iron Man Suit Photo',
        url: 'https://images.marvel.com/ironman.jpg',
        domain: 'images.marvel.com',
        imgSrc: 'https://images.marvel.com/ironman.jpg',
        engine: 'bing',
        engines: ['bing'],
        category: 'images',
      },
    ],
  };

  it('immediately clears previous results when switching category tabs', async () => {
    let resolveGeneral: (val: SearchResponse) => void;
    const generalPromise = new Promise<SearchResponse>((resolve) => {
      resolveGeneral = resolve;
    });

    vi.spyOn(searchApi, 'search').mockImplementation((params) => {
      if (params.category === 'general') {
        return generalPromise;
      }
      return Promise.resolve(mockImagesResponse);
    });

    const { result } = renderHook(() => useSearch());

    // 1. Start a general search
    act(() => {
      result.current.executeSearch('iron man', 'general', 1, false, false);
    });

    expect(result.current.isLoading).toBe(true);

    // Resolve general search
    await act(async () => {
      resolveGeneral!(mockGeneralResponse);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].title).toBe('Iron Man General Result');

    // 2. Now switch to 'images' tab while general search results were present
    let resolveImages: (val: SearchResponse) => void;
    const imagesPromise = new Promise<SearchResponse>((resolve) => {
      resolveImages = resolve;
    });
    vi.spyOn(searchApi, 'search').mockImplementation(() => imagesPromise);

    act(() => {
      result.current.handleCategoryChange('images');
    });

    // CRITICAL: results and response MUST be cleared immediately, and isLoading MUST be true
    expect(result.current.category).toBe('images');
    expect(result.current.results).toEqual([]);
    expect(result.current.response).toBeNull();
    expect(result.current.isLoading).toBe(true);

    // 3. Resolve images search
    await act(async () => {
      resolveImages!(mockImagesResponse);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.category).toBe('images');
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].title).toBe('Iron Man Suit Photo');
  });

  it('does NOT reset isLoading to false if an in-flight search is aborted by a tab switch', async () => {
    let rejectGeneralAbort: (reason: any) => void;
    const pendingGeneralSearch = new Promise<SearchResponse>((_, reject) => {
      rejectGeneralAbort = reject;
    });

    let resolveImages: (val: SearchResponse) => void;
    const pendingImagesSearch = new Promise<SearchResponse>((resolve) => {
      resolveImages = resolve;
    });

    vi.spyOn(searchApi, 'search').mockImplementation((params, signal) => {
      if (signal) {
        signal.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.');
          err.name = 'AbortError';
          rejectGeneralAbort(err);
        });
      }
      if (params.category === 'general') {
        return pendingGeneralSearch;
      }
      return pendingImagesSearch;
    });

    const { result } = renderHook(() => useSearch());

    // Start general search (in flight)
    act(() => {
      result.current.executeSearch('iron man', 'general', 1, false, false);
    });

    expect(result.current.isLoading).toBe(true);

    // Switch tab while general search is STILL LOADING
    act(() => {
      result.current.handleCategoryChange('images');
    });

    // Stale results must not exist and category must be 'images'
    expect(result.current.category).toBe('images');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    // Let the aborted general request reject and run its finally block
    await act(async () => {
      await Promise.resolve(); // flush microtasks
    });

    // isLoading MUST STILL BE TRUE for the images request!
    expect(result.current.isLoading).toBe(true);
    expect(result.current.results).toEqual([]);

    // Finally resolve images search
    await act(async () => {
      resolveImages!(mockImagesResponse);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.results[0].title).toBe('Iron Man Suit Photo');
  });
});
