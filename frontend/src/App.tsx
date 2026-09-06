import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';
import { useSearch } from './hooks/useSearch';
import { useSettings } from './hooks/useSettings';
import { ActivePage, SearchCategory } from './types';

export const App: React.FC = () => {
  const {
    query,
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
  } = useSearch();

  const { toggleTheme } = useSettings();

  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') ? 'results' : 'home';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePage(params.get('q') ? 'results' : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleTheme]);

  const handleSearchFromHome = (searchQuery: string, searchCategory: SearchCategory) => {
    setActivePage('results');
    executeSearch(searchQuery, searchCategory, 1, false);
  };

  const handleHeaderSearch = (searchQuery: string) => {
    setActivePage('results');
    executeSearch(searchQuery, category, 1, false);
  };

  const handleNavigate = (pageTarget: ActivePage) => {
    setActivePage(pageTarget);
    if (pageTarget === 'home') {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.pushState({}, '', url.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zen-bg-light dark:bg-zen-bg-dark bg-mesh-light dark:bg-mesh-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        showSearchBar={activePage === 'results'}
        searchQuery={query}
        onSearch={handleHeaderSearch}
      />

      <main className="flex-1 flex flex-col">
        {activePage === 'home' && (
          <HomePage
            onSearch={handleSearchFromHome}
            selectedCategory={category}
            onSelectCategory={handleCategoryChange}
            onOpenPrivacy={() => handleNavigate('privacy')}
          />
        )}

        {activePage === 'results' && (
          <SearchResultsPage
            query={query}
            category={category}
            page={page}
            response={response}
            results={results}
            isLoading={isLoading}
            error={error}
            onCategoryChange={handleCategoryChange}
            onPageChange={handlePageChange}
            onRetry={retrySearch}
            onNewSearch={handleHeaderSearch}
          />
        )}

        {activePage === 'privacy' && (
          <PrivacyPage onBack={() => handleNavigate(query ? 'results' : 'home')} />
        )}

        {activePage === 'about' && (
          <AboutPage onBack={() => handleNavigate(query ? 'results' : 'home')} />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
