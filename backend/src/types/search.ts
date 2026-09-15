import { QueryIntent } from '../services/queryUnderstanding.service';
import { NemotronClassification } from '../schemas/validation';

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
  type?: string;
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
  engine?: string;
  engines: string[];
  category: string;
  score?: number;
  thumbnail?: string;
  imgSrc?: string;
  imageUrl?: string;
  sourceUrl?: string;
  publishedDate?: string;
  publishedAt?: string;
  author?: string;
  duration?: string;
  resolution?: string;
  isNavigational?: boolean;
  sourceType?: 'web' | 'image' | 'news';
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
  aiIntent?: NemotronClassification;
  imageHighlights?: ZenvoraResultItem[];
}

export { QueryIntent, NemotronClassification };
