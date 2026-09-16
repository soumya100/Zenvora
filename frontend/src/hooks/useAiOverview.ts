import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AiOverviewResponse,
  AiOverviewSource,
  AiOverviewChatMessage,
  SearchCategory,
  SearchResultItem,
} from '../types';
import { searchApi } from '../services/api';

// In-memory session cache for AI Overviews
const overviewMemoryCache = new Map<string, AiOverviewResponse>();

export function useAiOverview(
  query: string,
  category: SearchCategory,
  searchResults: SearchResultItem[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<AiOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversational state
  const [messages, setMessages] = useState<AiOverviewChatMessage[]>([]);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  const cleanQ = query.trim();

  // Determine if query is an image/wallpaper search that should prioritize images instead of heavy text
  const isVisualQuery =
    /^(?:wallpapers?|photos?|backgrounds?|images?|pics?)\b/i.test(cleanQ) ||
    /\b(?:wallpapers?|4k wallpapers?|hd backgrounds?)\b/i.test(cleanQ);

  const shouldFetch =
    enabled &&
    cleanQ.length > 0 &&
    (category === 'general' || category === 'it' || category === 'science') &&
    !isVisualQuery;

  // Reset conversation if top-level query changes
  useEffect(() => {
    if (cleanQ !== lastQueryRef.current) {
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
        chatAbortControllerRef.current = null;
      }
      setMessages([]);
      setIsGeneratingFollowUp(false);
      setFollowUpError(null);
    }
  }, [cleanQ]);

  const fetchOverview = useCallback(
    async (forceRetry: boolean = false) => {
      if (!shouldFetch) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setData(null);
        setIsLoading(false);
        setIsStreaming(false);
        setError(null);
        lastQueryRef.current = '';
        return;
      }

      const cacheKey = cleanQ.toLowerCase();

      // Check in-memory cache if not forcing retry
      if (!forceRetry && overviewMemoryCache.has(cacheKey)) {
        const cached = overviewMemoryCache.get(cacheKey)!;
        setData(cached);
        setIsLoading(false);
        setIsStreaming(false);
        setError(null);
        lastQueryRef.current = cleanQ;
        return;
      }

      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      lastQueryRef.current = cleanQ;

      setIsLoading(true);
      setIsStreaming(false);
      setError(null);
      setData(null);

      let streamedAnswer = '';
      let detectedSources: AiOverviewSource[] = [];

      try {
        await searchApi.streamAiOverview(
          cleanQ,
          searchResults.length > 0 ? searchResults : undefined,
          {
            onSources: (sources, status) => {
              if (abortControllerRef.current !== controller) return;
              detectedSources = sources;
              setData((prev) => ({
                query: cleanQ,
                answer: prev?.answer || '',
                sources,
                status: (status as any) || 'success',
              }));
              setIsLoading(false);
              setIsStreaming(true);
            },
            onDelta: (_delta, accumulated) => {
              if (abortControllerRef.current !== controller) return;
              streamedAnswer = accumulated;
              setData({
                query: cleanQ,
                answer: accumulated,
                sources: detectedSources,
                status: 'success',
              });
              setIsLoading(false);
              setIsStreaming(true);
            },
            onDone: (finalData) => {
              if (abortControllerRef.current !== controller) return;
              setData(finalData);
              overviewMemoryCache.set(cacheKey, finalData);
              setIsLoading(false);
              setIsStreaming(false);
            },
            onError: (err) => {
              if (abortControllerRef.current !== controller) return;
              if (streamedAnswer) {
                const partialData: AiOverviewResponse = {
                  query: cleanQ,
                  answer: streamedAnswer,
                  sources: detectedSources,
                  status: 'success',
                };
                setData(partialData);
                overviewMemoryCache.set(cacheKey, partialData);
              } else {
                setError(err.message || 'AI Overview is temporarily unavailable.');
              }
              setIsLoading(false);
              setIsStreaming(false);
            },
          },
          controller.signal
        );
      } catch (err: any) {
        if (err.name === 'AbortError' || abortControllerRef.current !== controller) {
          return;
        }
        setError(err.message || 'AI Overview is temporarily unavailable.');
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          setIsStreaming(false);
        }
      }
    },
    [cleanQ, shouldFetch, searchResults]
  );

  useEffect(() => {
    fetchOverview(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }
    };
  }, [cleanQ, category, shouldFetch]);

  /**
   * Send a follow-up question to continue the interactive session.
   */
  const sendFollowUpMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGeneratingFollowUp) return;

      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      chatAbortControllerRef.current = controller;

      const userMsgId = `usr-${Date.now()}`;
      const asstMsgId = `ast-${Date.now() + 1}`;

      const userMsg: AiOverviewChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      const asstMsg: AiOverviewChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        content: '',
        sources: [],
        timestamp: Date.now(),
      };

      // Build history for backend
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // If this is the first follow-up, include the initial overview answer in history
      if (conversationHistory.length === 0 && data?.answer) {
        conversationHistory.push({
          role: 'assistant',
          content: data.answer,
        });
      }

      setMessages((prev) => [...prev, userMsg, asstMsg]);
      setIsGeneratingFollowUp(true);
      setFollowUpError(null);

      let accumulatedReply = '';
      let receivedSources: AiOverviewSource[] = [];

      try {
        await searchApi.streamAiOverviewChat(
          {
            originalQuery: cleanQ,
            message: trimmed,
            conversationHistory,
            searchResults: data?.sources,
          },
          {
            onSources: (sources) => {
              if (chatAbortControllerRef.current !== controller) return;
              receivedSources = sources;
              setMessages((prev) =>
                prev.map((m) => (m.id === asstMsgId ? { ...m, sources } : m))
              );
            },
            onDelta: (_delta, acc) => {
              if (chatAbortControllerRef.current !== controller) return;
              accumulatedReply = acc;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstMsgId ? { ...m, content: acc, sources: receivedSources } : m
                )
              );
            },
            onDone: (res) => {
              if (chatAbortControllerRef.current !== controller) return;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstMsgId
                    ? { ...m, content: res.reply || accumulatedReply, sources: res.sources || receivedSources }
                    : m
                )
              );
              setIsGeneratingFollowUp(false);
            },
            onError: (err) => {
              if (chatAbortControllerRef.current !== controller) return;
              if (accumulatedReply) {
                // Keep partial response
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === asstMsgId
                      ? { ...m, content: accumulatedReply, sources: receivedSources }
                      : m
                  )
                );
              } else {
                // Remove empty assistant placeholder if failed completely
                setMessages((prev) => prev.filter((m) => m.id !== asstMsgId));
              }
              setFollowUpError(err.message || 'Failed to generate follow-up answer.');
              setIsGeneratingFollowUp(false);
            },
          },
          controller.signal
        );
      } catch (err: any) {
        if (err.name === 'AbortError' || chatAbortControllerRef.current !== controller) {
          return;
        }
        setFollowUpError(err.message || 'Failed to generate follow-up answer.');
      } finally {
        if (chatAbortControllerRef.current === controller) {
          setIsGeneratingFollowUp(false);
        }
      }
    },
    [cleanQ, data, messages, isGeneratingFollowUp]
  );

  /**
   * Retry sending the last user message in the thread.
   */
  const retryLastFollowUp = useCallback(() => {
    if (messages.length === 0 || isGeneratingFollowUp) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove any trailing assistant message that failed or is empty
    setMessages((prev) => {
      const lastIndex = prev.map((m) => m.id).lastIndexOf(lastUserMsg.id);
      return prev.slice(0, lastIndex);
    });

    sendFollowUpMessage(lastUserMsg.content);
  }, [messages, isGeneratingFollowUp, sendFollowUpMessage]);

  return {
    data,
    isLoading,
    isStreaming,
    error,
    refetch: () => fetchOverview(true),
    shouldDisplay: shouldFetch,
    messages,
    sendFollowUpMessage,
    isGeneratingFollowUp,
    followUpError,
    retryLastFollowUp,
  };
}
