export type SearchCategory =
  | 'general'
  | 'news'
  | 'images'
  | 'videos'
  | 'science'
  | 'it';

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  engine: string;
  engines: string[];
  category: string;
  score?: number;
  thumbnail?: string;
  imgSrc?: string;
  sourceUrl?: string;
  publishedDate?: string;
  author?: string;
  duration?: string;
  resolution?: string;
  isNavigational?: boolean;
}

export interface SearchInfoboxAttribute {
  label: string;
  value: string;
}

export interface SearchInfobox {
  title: string;
  content: string;
  url?: string;
  imgSrc?: string;
  source?: string;
  attributes?: SearchInfoboxAttribute[];
}

export interface SearchResponse {
  query: string;
  category: SearchCategory;
  page: number;
  results: SearchResultItem[];
  answers: string[];
  infoboxes: SearchInfobox[];
  suggestions: string[];
  unresponsiveEngines: string[];
  numberOfResults: number;
  searchDuration: number;
  cached: boolean;
  mock?: boolean;
}

export type ThemePreference = 'dark' | 'light' | 'system';
export type LogoScheme = 'sunset' | 'aurora' | 'cyber';

export interface UserSettings {
  theme: ThemePreference;
  logoScheme?: LogoScheme;
  safeSearch: number;
  language: string;
  region: string;
  resultsPerPage: number;
  openInNewTab: boolean;
  defaultCategory: SearchCategory;
  infiniteScroll: boolean;
  showSuggestions: boolean;
}

export type ActivePage = 'home' | 'results' | 'privacy' | 'about';

