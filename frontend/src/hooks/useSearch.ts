import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchCategory, SearchResponse, SearchResultItem } from '../types';
import { searchApi } from '../services/api';
import { useSettings } from './useSettings';

export function useSearch() {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>(settings.defaultCategory || 'general');
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchedKeyRef = useRef<string>('');
  const categoryRef = useRef<SearchCategory>(category);
  const resultsRef = useRef<SearchResultItem[]>([]);
  const settingsRef = useRef(settings);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const executeSearch = useCallback(
    async (
      searchQuery: string,
      searchCategory: SearchCategory = categoryRef.current,
      searchPage: number = 1,
      appendResults: boolean = false,
      pushHistory: boolean = true
    ) => {
      const cleanQ = searchQuery.trim();
      if (!cleanQ) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setCategory(searchCategory);
        setPage(1);
        setResponse(null);
        setResults([]);
        resultsRef.current = [];
        setIsLoading(false);
        setError(null);
        lastSearchedKeyRef.current = '';
        return;
      }

      const searchKey = `${cleanQ}:${searchCategory}:${searchPage}`;
      if (
        lastSearchedKeyRef.current === searchKey &&
        !appendResults &&
        resultsRef.current.length > 0 &&
        categoryRef.current === searchCategory
      ) {
        return;
      }

      // 1. Abort any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 2. Immediately update category, page, and query state
      setCategory(searchCategory);
      setPage(searchPage);
      setQuery(cleanQ);

      // 3. Immediately clear stale results if switching tab or performing a new search
      if (!appendResults) {
        setResults([]);
        resultsRef.current = [];
        setResponse(null);
      }

      setIsLoading(true);
      setError(null);

      if (pushHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set('q', cleanQ);
        if (searchCategory !== 'general') {
          url.searchParams.set('category', searchCategory);
        } else {
          url.searchParams.delete('category');
        }
        if (searchPage > 1) {
          url.searchParams.set('page', searchPage.toString());
        } else {
          url.searchParams.delete('page');
        }
        window.history.pushState({}, '', url.toString());
      }

      try {
        const data = await searchApi.search(
          {
            q: cleanQ,
            category: searchCategory,
            page: searchPage,
            safesearch: settingsRef.current.safeSearch,
            language: settingsRef.current.language,
          },
          controller.signal
        );

        // If another request started while this request was in flight, ignore this response
        if (abortControllerRef.current !== controller) {
          return;
        }

        lastSearchedKeyRef.current = searchKey;
        setResponse(data);
        if (appendResults) {
          setResults((prev) => {
            const next = [...prev, ...data.results];
            resultsRef.current = next;
            return next;
          });
        } else {
          setResults(data.results);
          resultsRef.current = data.results;
        }
      } catch (err: any) {
        // If aborted or this request is no longer active, do not touch state
        if (err.name === 'AbortError' || abortControllerRef.current !== controller) {
          return;
        }
        setError(err.message || 'Search service temporarily unavailable.');
      } finally {
        // ONLY stop loading if this controller is STILL the active controller
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      const cat = (params.get('category') as SearchCategory) || 'general';
      const p = Math.max(1, parseInt(params.get('page') || '1', 10));

      if (q) {
        setQuery(q);
        setCategory(cat);
        setPage(p);
        executeSearch(q, cat, p, false, false);
      }
    };

    parseUrlParams();
    window.addEventListener('popstate', parseUrlParams);
    return () => window.removeEventListener('popstate', parseUrlParams);
  }, [executeSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPage(newPage);
    setResults([]);
    resultsRef.current = [];
    setResponse(null);
    lastSearchedKeyRef.current = '';
    executeSearch(query, category, newPage, false, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (newCategory: SearchCategory) => {
    if (newCategory === category && results.length > 0) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCategory(newCategory);
    setPage(1);
    setResults([]);
    resultsRef.current = [];
    setResponse(null);
    lastSearchedKeyRef.current = '';
    executeSearch(query, newCategory, 1, false, true);
  };

  const retrySearch = () => {
    lastSearchedKeyRef.current = '';
    setResults([]);
    resultsRef.current = [];
    setResponse(null);
    executeSearch(query, category, page, false, false);
  };

  return {
    query,
    setQuery,
    category,
    page,
    response,
    results,
    isLoading,
    error,
    executeSearch,
    handlePageChange,
    handleCategoryChange,
    retrySearch,
  };
}
