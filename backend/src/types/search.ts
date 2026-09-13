export type ZenvoraCategory =
  | 'general'
  | 'news'
  | 'images'
  | 'videos'
  | 'science'
  | 'it';

export interface ZenvoraSearchQuery {
  q: string;
  category?: ZenvoraCategory;
  page?: number;
  safesearch?: number; // 0 = off, 1 = moderate, 2 = strict
  language?: string;
  region?: string;
  timeRange?: string; // day, week, month, year
}

export interface ZenvoraResultItem {
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

export interface ZenvoraInfoboxAttribute {
  label: string;
  value: string;
}

export interface ZenvoraInfobox {
  title: string;
  content: string;
  url?: string;
  imgSrc?: string;
  source?: string;
  attributes?: ZenvoraInfoboxAttribute[];
}

import { QueryIntent } from '../services/queryUnderstanding.service';

export interface ZenvoraSearchResponse {
  query: string;
  category: ZenvoraCategory;
  page: number;
  results: ZenvoraResultItem[];
  answers: string[];
  infoboxes: ZenvoraInfobox[];
  suggestions: string[];
  unresponsiveEngines: string[];
  numberOfResults: number;
  searchDuration: number;
  cached: boolean;
  mock?: boolean;
  queryIntent?: QueryIntent;
  imageHighlights?: ZenvoraResultItem[];
}

export { QueryIntent };

