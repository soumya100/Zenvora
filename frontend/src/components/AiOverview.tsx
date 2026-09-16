import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Globe,
  Check,
  Copy,
  BookOpen,
  ArrowUp,
  User,
  AlertCircle,
} from 'lucide-react';
import { AiOverviewSource, SearchCategory, SearchResultItem } from '../types';
import { useAiOverview } from '../hooks/useAiOverview';

interface AiOverviewProps {
  query: string;
  category: SearchCategory;
  searchResults: SearchResultItem[];
}

export const AiOverview: React.FC<AiOverviewProps> = ({ query, category, searchResults }) => {
  const {
    data,
    isLoading,
    isStreaming,
    error,
    refetch,
    shouldDisplay,
    messages,
    sendFollowUpMessage,
    isGeneratingFollowUp,
    followUpError,
    retryLastFollowUp,
  } = useAiOverview(query, category, searchResults);

  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const suggestedFollowUps = useMemo(() => getSuggestedFollowUps(query), [query]);

  // Auto-scroll conversation to bottom when new messages arrive or stream updates
  useEffect(() => {
    if (messages.length > 0 && chatBottomRef.current) {
      chatBottomRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isGeneratingFollowUp]);

  const handleCopy = (text: string, turnId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTurnId(turnId);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  const handleSend = () => {
    const trimmed = inputQuery.trim();
    if (!trimmed || isGeneratingFollowUp) return;
    sendFollowUpMessage(trimmed);
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  if (!shouldDisplay) {
    return null;
  }

  // Loading Skeleton (Zero Layout Shift)
  if (isLoading && !data) {
    return (
      <div
        className="mb-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zen-bg-darkCard/80 border border-slate-200 dark:border-zen-bg-darkBorder shadow-sm"
        role="region"
        aria-label="AI Overview Loading"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-500" />
            </div>
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>

        <div className="space-y-2.5 mb-5">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-[92%] animate-pulse" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-[85%] animate-pulse" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-[70%] animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-zen-bg-darkBorder/60">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard/40 border border-slate-100 dark:border-zen-bg-darkBorder/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error && !data?.answer) {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>AI Overview is temporarily unavailable. You can still explore the search results below.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty / Insufficient Sources State
  if (data?.status === 'insufficient_sources' || (data && !data.answer && data.sources.length === 0)) {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zen-bg-darkCard/50 border border-slate-200 dark:border-zen-bg-darkBorder/70 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <span>Not enough reliable sources were found to generate an overview. Explore the web results below.</span>
        </div>
      </div>
    );
  }

  if (!data?.answer) {
    return null;
  }

  const initialSources = data.sources || [];
  const hasLongAnswer = data.answer.length > 350;

  return (
    <div
      className="mb-6 rounded-2xl bg-white dark:bg-zen-bg-darkCard border border-slate-200/90 dark:border-zen-bg-darkBorder shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
      role="region"
      aria-label="AI Search Overview"
    >
      {/* Header Bar */}
      <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zen-bg-darkBorder/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-sm shadow-cyan-500/20 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Overview
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>powered by NVIDIA Nemotron</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              Generative AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isStreaming || isGeneratingFollowUp) && (
            <span className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 animate-pulse font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              {isStreaming ? 'Generating...' : 'Responding...'}
            </span>
          )}
          <button
            onClick={() => handleCopy(data.answer, 'initial')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy initial answer"
            aria-label="Copy answer to clipboard"
          >
            {copiedTurnId === 'initial' ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Answer Body Container */}
      <div className="px-5 sm:px-6 py-4">
        <div
          className={`text-[14.5px] sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 space-y-3 transition-all duration-300 relative ${
            !isExpanded && hasLongAnswer ? 'max-h-[170px] overflow-hidden' : ''
          }`}
        >
          <RenderMarkdown
            content={data.answer}
            sources={initialSources}
            turnId="initial"
            onCitationHover={(srcId) => setHighlightedSourceId(srcId)}
            onCitationClick={(srcId) => {
              setHighlightedSourceId(srcId);
              const el = document.getElementById(`source-card-initial-${srcId}`);
              if (el) el?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
            }}
          />

          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse align-middle" />
          )}

          {/* Fade gradient when collapsed */}
          {!isExpanded && hasLongAnswer && (
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-zen-bg-darkCard to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand / Collapse Button */}
        {hasLongAnswer && (
          <div className="pt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors py-1 focus:outline-none"
            >
              <span>{isExpanded ? 'Show less' : 'Show more'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Initial Supporting Sources */}
        {initialSources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zen-bg-darkBorder/60">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Supporting Sources ({initialSources.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                Click citations to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {initialSources.map((source, idx) => {
                const sourceNum = idx + 1;
                const isHighlighted =
                  highlightedSourceId === `src-${sourceNum}` || highlightedSourceId === source.id;

                return (
                  <SourceCard
                    key={source.id || idx}
                    source={source}
                    index={sourceNum}
                    turnId="initial"
                    isHighlighted={isHighlighted}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Conversational Thread */}
        {messages.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-zen-bg-darkBorder/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Follow-up Discussion</span>
            </div>

            {messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                      <div className="p-3 sm:px-4 sm:py-2.5 rounded-2xl rounded-tr-sm bg-cyan-600 text-white shadow-sm text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-600 dark:text-slate-300">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              }

              // Assistant message
              const turnSources = msg.sources || [];
              const isTurnStreaming = isGeneratingFollowUp && !msg.content && msg.id === messages[messages.length - 1]?.id;

              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[90%] w-full">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 p-4 rounded-2xl rounded-tl-sm bg-slate-50 dark:bg-zen-bg-darkCard/50 border border-slate-200/70 dark:border-zen-bg-darkBorder/60 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Zenvora AI
                        </span>
                        {msg.content && (
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Copy reply"
                            aria-label="Copy reply"
                          >
                            {copiedTurnId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {isTurnStreaming ? (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                          <span>Finding answers and synthesizing overview...</span>
                        </div>
                      ) : (
                        <div className="text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 space-y-2.5">
                          <RenderMarkdown
                            content={msg.content}
                            sources={turnSources}
                            turnId={msg.id}
                            onCitationHover={(srcId) => setHighlightedSourceId(srcId)}
                            onCitationClick={(srcId) => {
                              setHighlightedSourceId(srcId);
                              const el = document.getElementById(`source-card-${msg.id}-${srcId}`);
                              if (el) el?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
                            }}
                          />
                          {isGeneratingFollowUp && msg.id === messages[messages.length - 1]?.id && (
                            <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-500 animate-pulse align-middle" />
                          )}
                        </div>
                      )}

                      {/* Turn-specific supporting sources */}
                      {turnSources.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zen-bg-darkBorder/40">
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                            Turn Sources ({turnSources.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {turnSources.map((source, sIdx) => (
                              <SourceCard
                                key={source.id || sIdx}
                                source={source}
                                index={sIdx + 1}
                                turnId={msg.id}
                                isHighlighted={
                                  highlightedSourceId === `src-${sIdx + 1}` ||
                                  highlightedSourceId === source.id
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Follow-up Error Alert */}
        {followUpError && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{followUpError}</span>
            </div>
            <button
              onClick={retryLastFollowUp}
              className="px-2.5 py-1 rounded bg-white dark:bg-zen-bg-darkCard border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-50 font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Follow-up Input Box */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zen-bg-darkBorder/60">
          {/* Suggested Follow-up Chips */}
          {suggestedFollowUps.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>Suggested follow-ups</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedFollowUps.map((suggestion, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    disabled={isGeneratingFollowUp}
                    onClick={() => {
                      sendFollowUpMessage(suggestion);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zen-bg-darkCard/80 border border-slate-200/90 dark:border-zen-bg-darkBorder/80 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/5 transition-all text-left shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{suggestion}</span>
                    <ArrowUp className="w-3 h-3 rotate-45 opacity-60 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center rounded-2xl bg-slate-50 dark:bg-zen-bg-darkCard/90 border border-slate-200 dark:border-zen-bg-darkBorder hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-cyan-500 dark:focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all p-1.5 shadow-2xs"
          >
            <div className="pl-2.5 pr-1.5 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isGeneratingFollowUp}
              placeholder="Ask a follow-up question..."
              className="w-full py-1.5 px-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-none disabled:opacity-50 max-h-[140px]"
              aria-label="Ask a follow-up question"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isGeneratingFollowUp}
              className="shrink-0 w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-30 disabled:hover:bg-cyan-600 flex items-center justify-center transition-colors shadow-xs ml-1"
              title="Send question (Enter)"
              aria-label="Send question"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="hidden sm:inline">Responses are grounded in web search results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SourceCardProps {
  source: AiOverviewSource;
  index: number;
  turnId?: string;
  isHighlighted: boolean;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, index, turnId = 'initial', isHighlighted }) => {
  const [faviconError, setFaviconError] = useState(false);

  return (
    <a
      id={`source-card-${turnId}-src-${index}`}
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-3 rounded-xl border transition-all duration-200 text-left ${
        isHighlighted
          ? 'bg-cyan-500/10 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
          : 'bg-slate-50/70 dark:bg-zen-bg-darkCard/40 border-slate-200/80 dark:border-zen-bg-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-zen-bg-darkCard/80'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-4 h-4 shrink-0 rounded overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-700">
          {!faviconError && source.favicon ? (
            <img
              src={source.favicon}
              alt=""
              className="w-full h-full object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Globe className="w-3 h-3 text-slate-400" />
          )}
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
          {source.domain}
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          [{index}]
        </span>
      </div>

      <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 line-clamp-1 transition-colors">
        {source.title}
      </h4>

      {source.snippet && (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
          {source.snippet}
        </p>
      )}

      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 font-medium">
        <span>Visit link</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </div>
    </a>
  );
};

interface RenderMarkdownProps {
  content: string;
  sources: AiOverviewSource[];
  turnId?: string;
  onCitationHover: (sourceId: string | null) => void;
  onCitationClick: (sourceId: string) => void;
}

/**
 * Lightweight, secure markdown parser for AI Overview answers.
 * Transforms paragraphs, lists, bold text, code blocks, and replaces [1], [2] with interactive citation pills.
 */
const RenderMarkdown: React.FC<RenderMarkdownProps> = ({
  content,
  onCitationHover,
  onCitationClick,
}) => {
  const cleanContent = useMemo(() => cleanUserFacingText(content), [content]);

  const renderedElements = useMemo(() => {
    if (!cleanContent) return null;

    const blocks = cleanContent.split(/\n\n+/);

    return blocks.map((block, blockIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Code blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        const codeLines = trimmed.split('\n');
        const codeText = codeLines.slice(1, -1).join('\n') || codeLines.slice(1).join('\n');
        return (
          <pre
            key={blockIdx}
            className="my-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 dark:bg-slate-950 font-mono text-xs overflow-x-auto border border-slate-800"
          >
            <code>{codeText}</code>
          </pre>
        );
      }

      // Headings (### or ##)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={blockIdx} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1">
            {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''), onCitationHover, onCitationClick)}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={blockIdx} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2.5 mb-1">
            {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''), onCitationHover, onCitationClick)}
          </h2>
        );
      }

      // Bullet lists (- or *)
      if (trimmed.split('\n').every((line) => /^\s*[-*]\s+/.test(line))) {
        const listItems = trimmed.split('\n').filter((l) => /^\s*[-*]\s+/.test(l));
        return (
          <ul key={blockIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-cyan-500">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="pl-1">
                {renderInlineMarkdown(item.replace(/^\s*[-*]\s+/, ''), onCitationHover, onCitationClick)}
              </li>
            ))}
          </ul>
        );
      }

      // Numbered lists (1. 2.)
      if (trimmed.split('\n').every((line) => /^\s*\d+\.\s+/.test(line))) {
        const listItems = trimmed.split('\n').filter((l) => /^\s*\d+\.\s+/.test(l));
        return (
          <ol key={blockIdx} className="space-y-1.5 my-2 pl-5 list-decimal marker:text-cyan-500 font-medium">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="pl-1">
                {renderInlineMarkdown(item.replace(/^\s*\d+\.\s+/, ''), onCitationHover, onCitationClick)}
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph
      return (
        <p key={blockIdx} className="leading-relaxed">
          {renderInlineMarkdown(trimmed, onCitationHover, onCitationClick)}
        </p>
      );
    });
  }, [cleanContent, onCitationHover, onCitationClick]);

  return <>{renderedElements}</>;
};

function renderInlineMarkdown(
  text: string,
  onCitationHover: (sourceId: string | null) => void,
  onCitationClick: (sourceId: string) => void
): React.ReactNode[] {
  // Matches bold (**bold**), inline code (`code`), or citation brackets ([1], [2], [1, 2])
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[\d+(?:,\s*\d+)*\])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold text (**word**)
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code (`code`)
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-[13px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Citation badge: [1], [2], [1, 2]
    const citationMatch = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
    if (citationMatch) {
      const numbers = citationMatch[1].split(',').map((n) => n.trim());
      return (
        <span key={idx} className="inline-flex items-center gap-0.5 mx-0.5 align-baseline">
          {numbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onCitationClick(`src-${num}`)}
              onMouseEnter={() => onCitationHover(`src-${num}`)}
              onMouseLeave={() => onCitationHover(null)}
              className="inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded-full bg-cyan-500/15 hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 hover:text-white dark:hover:text-slate-950 transition-colors shadow-xs cursor-pointer"
              title={`Jump to Source [${num}]`}
              aria-label={`Source citation ${num}`}
            >
              {num}
            </button>
          ))}
        </span>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Defensive front-end sanitization filter.
 * Ensures that even if an AI provider returns chain-of-thought, thinking traces,
 * or meta-reasoning, it is completely stripped before markdown rendering.
 */
export function cleanUserFacingText(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // 1. Remove XML/HTML style <think>...</think> or <thought>...</thought> blocks
  text = text.replace(/<(?:think|thought|reasoning|analysis)>[\s\S]*?<\/(?:think|thought|reasoning|analysis)>/gi, '');
  text = text.replace(/^<(?:think|thought|reasoning|analysis)>[\s\S]*$/gi, '');

  // 2. Remove "Here's a thinking process:"
  if (/Here's (?:a |the |my )?thinking process:?/i.test(text)) {
    const parts = text.split(
      /Here's (?:a |the |my )?thinking process:?[\s\S]*?(?=(?:\n\n|\r\n\r\n)(?:#{1,4}\s|\*\*|[A-Z][a-zA-Z0-9\s,-]+(?:\s*(?:is|was|are|were|represents|refers|introduced|created|first|born|published)\b)|[-*•]\s+|\d+\.\s+))/i
    );
    if (parts.length > 1 && parts[parts.length - 1].trim().length > 20) {
      text = parts[parts.length - 1].trim();
    } else {
      const lines = text.split(/\r?\n/).filter((line) => {
        const low = line.toLowerCase();
        return (
          !low.includes("here's a thinking process") &&
          !low.includes('analyze user input') &&
          !low.includes('review search evidence') &&
          !low.includes('the guidelines say') &&
          !low.includes('i need to be careful') &&
          !low.includes('the search evidence')
        );
      });
      text = lines.join('\n').trim();
    }
  }

  // 3. Remove residual meta-instructions
  text = text.replace(/^(?:\d+\.\s*)?\*?\*?(?:Analyze User Input|Review Search Evidence|Identify Key Facts|Draft Response)\*?\*?:?.*$/gmi, '');
  text = text.replace(/^.*(?:The search evidence doesn't explicitly|However, the guidelines say:|I need to be careful|I should either:).*$/gmi, '');

  return text.trim();
}

/**
 * Returns contextual suggested follow-up questions modeled after Google Search AI Overview.
 */
export function getSuggestedFollowUps(query: string): string[] {
  const cleanQ = query.trim().toLowerCase();

  // Character / Superhero / Pop culture queries (e.g. Spider-Man, Batman)
  if (
    cleanQ.includes('spider') ||
    cleanQ.includes('batman') ||
    cleanQ.includes('superman') ||
    cleanQ.includes('marvel') ||
    cleanQ.includes('dc') ||
    cleanQ.includes('hero') ||
    cleanQ.includes('comic')
  ) {
    return [
      'What is his comic book origin?',
      'What are his powers and abilities?',
      'Who created Spider-Man?',
      'Which movies feature Spider-Man?',
    ];
  }

  // Comparisons (e.g. "React vs Vue")
  if (cleanQ.includes(' vs ') || cleanQ.includes(' versus ') || cleanQ.includes(' compare ')) {
    return [
      'Which one has better performance?',
      'Which is easier to learn for beginners?',
      'What are the key differences?',
      'When should I choose one over the other?',
    ];
  }

  // Tech / Frameworks / Development (e.g. "What is React", "Nginx", "Docker")
  if (
    cleanQ.includes('react') ||
    cleanQ.includes('vue') ||
    cleanQ.includes('nginx') ||
    cleanQ.includes('docker') ||
    cleanQ.includes('python') ||
    cleanQ.includes('javascript') ||
    cleanQ.includes('node') ||
    cleanQ.includes('api') ||
    cleanQ.includes('deploy')
  ) {
    return [
      'What are the core features and benefits?',
      'What is the best way to get started?',
      'How does it compare to alternatives?',
      'What are common real-world use cases?',
    ];
  }

  // How-to / Tutorial queries (e.g. "How to deploy CRA using Nginx")
  if (
    cleanQ.startsWith('how ') ||
    cleanQ.includes('deploy') ||
    cleanQ.includes('install') ||
    cleanQ.includes('setup') ||
    cleanQ.includes('tutorial')
  ) {
    return [
      'What are common troubleshooting steps?',
      'What are the required prerequisites?',
      'Are there alternative methods or tools?',
      'What are production security best practices?',
    ];
  }

  // News / Current Events queries
  if (cleanQ.includes('news') || cleanQ.includes('latest') || cleanQ.includes('update')) {
    return [
      'What are the most recent developments?',
      'Who are the key people or organizations involved?',
      'What is the broader impact?',
      'Where can I read the full source reports?',
    ];
  }

  // General query fallback
  const words = query.trim().split(/\s+/).slice(0, 3).join(' ');
  return [
    `What are the key facts about ${words}?`,
    `What is the history behind ${words}?`,
    `Who are the notable figures related to ${words}?`,
    `What are related topics to explore?`,
  ];
}

