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
  corsOrigin: process.env.CORS_ORIGIN || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  rateLimitAiMax: parseInt(process.env.RATE_LIMIT_AI_MAX || '15', 10),
  rateLimitImageProxyMax: parseInt(process.env.RATE_LIMIT_IMAGE_PROXY_MAX || '60', 10),
  rateLimitHealthMax: parseInt(process.env.RATE_LIMIT_HEALTH_MAX || '120', 10),
  mockSearch: process.env.MOCK_SEARCH === 'true',
  cacheTtlMs: 60 * 1000, // 60 seconds LRU cache

  // NVIDIA Nemotron AI Configuration
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
  nvidiaModel: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b',
  nvidiaBaseUrl: (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, ''),
  nvidiaTimeoutMs: parseInt(process.env.NVIDIA_TIMEOUT_MS || '15000', 10),
  nvidiaMaxTokens: parseInt(process.env.NVIDIA_MAX_TOKENS || '500', 10),
  aiEnabled: process.env.AI_ENABLED !== 'false',

  // Optional external search provider keys for enterprise/production deployments
  braveApiKey: process.env.BRAVE_SEARCH_API_KEY || '',
  bingApiKey: process.env.BING_SEARCH_API_KEY || '',
  googleApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
  googleCx: process.env.GOOGLE_SEARCH_CX || '',
};
