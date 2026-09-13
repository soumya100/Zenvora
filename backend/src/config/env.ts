import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if available
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // Also check local backend directory

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  searxngUrl: (process.env.SEARXNG_URL || 'http://searxng:8080').replace(/\/$/, ''),
  domain: process.env.DOMAIN || 'localhost',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  mockSearch: process.env.MOCK_SEARCH === 'true',
  cacheTtlMs: 60 * 1000, // 60 seconds LRU cache
  // Optional external search provider keys for enterprise/production deployments
  braveApiKey: process.env.BRAVE_SEARCH_API_KEY || '',
  bingApiKey: process.env.BING_SEARCH_API_KEY || '',
  googleApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
  googleCx: process.env.GOOGLE_SEARCH_CX || '',
};
