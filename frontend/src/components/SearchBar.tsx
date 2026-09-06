import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { searchApi } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useSettings } from '../hooks/useSettings';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  size?: 'normal' | 'large';
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearch,
  size = 'normal',
  autoFocus = false,
  className = '',
}) => {
  const { settings } = useSettings();
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedInput = useDebounce(inputValue, 200);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!settings.showSuggestions || !debouncedInput.trim() || debouncedInput.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    searchApi.getSuggestions(debouncedInput).then((items) => {
      if (isMounted && items.length > 0) {
        setSuggestions(items);
        setIsOpen(true);
      } else if (isMounted) {
        setSuggestions([]);
        setIsOpen(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedInput, settings.showSuggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) && target !== inputRef.current) {
        return;
      }

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetQuery = selectedIndex >= 0 && suggestions[selectedIndex] ? suggestions[selectedIndex] : inputValue;
    if (targetQuery.trim()) {
      setIsOpen(false);
      onSearch(targetQuery.trim());
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') handleSubmit();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const isLarge = size === 'large';

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`group flex items-center w-full transition-all duration-200 rounded-2xl border ${
            isLarge
              ? 'h-14 sm:h-16 px-4 sm:px-6 bg-white dark:bg-zen-bg-darkSurface shadow-xl dark:shadow-glow-cyan/10 border-slate-200 dark:border-zen-bg-darkBorder focus-within:border-cyan-500 dark:focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/15'
              : 'h-11 sm:h-12 px-3.5 sm:px-4 bg-slate-100 dark:bg-zen-bg-darkSurface border-slate-200 dark:border-zen-bg-darkBorder focus-within:border-cyan-500 dark:focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20'
          }`}
        >
          <Search
            className={`${
              isLarge ? 'w-5 sm:w-6 h-5 sm:h-6' : 'w-4 sm:w-5 h-4 sm:h-5'
            } text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200 shrink-0 mr-3`}
          />

          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder="Search the web privately..."
            autoFocus={autoFocus}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className={`w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${
              isLarge ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
            }`}
            aria-label="Search the web"
          />

          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-zen-bg-darkCard transition-colors mr-2"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-zen-bg-darkBorder">
            <kbd className="px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-zen-bg-darkCard text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-zen-bg-darkBorder select-none">
              /
            </kbd>
          </div>

          {isLarge && (
            <button
              type="submit"
              className="ml-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm sm:text-base shadow-md hover:shadow-cyan-500/25 transition-all duration-200 shrink-0"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zen-bg-darkSurface border border-slate-200 dark:border-zen-bg-darkBorder rounded-2xl shadow-2xl overflow-hidden glass-panel divide-y divide-slate-100 dark:divide-zen-bg-darkBorder/50 animate-fade-in"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInputValue(suggestion);
                    setIsOpen(false);
                    onSearch(suggestion);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-sm sm:text-base ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-zen-bg-darkCard text-cyan-600 dark:text-cyan-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zen-bg-darkCard/50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-slate-50 dark:bg-zen-bg-darkCard/40 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              Private Autocomplete (No Logs)
            </span>
            <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to select</span>
          </div>
        </div>
      )}
    </div>
  );
};
