import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if available (root, local backend, or parent)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

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

  // AI Configuration (NVIDIA Nemotron, OpenAI-compatible, or custom)
  aiProvider: process.env.AI_PROVIDER || 'nvidia',
  aiApiKey:
    process.env.NODE_ENV === 'test'
      ? (process.env.AI_TEST_API_KEY || '')
      : (process.env.AI_API_KEY || process.env.NVIDIA_API_KEY || ''),
  aiModel: process.env.AI_MODEL || process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b',
  aiBaseUrl: (process.env.AI_BASE_URL || process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, ''),
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || process.env.NVIDIA_TIMEOUT_MS || '20000', 10),
  aiMaxTokens: parseInt(process.env.AI_MAX_TOKENS || process.env.NVIDIA_MAX_TOKENS || '1500', 10),
  aiEnabled: process.env.AI_ENABLED !== 'false',

  // NVIDIA Nemotron AI Configuration (backwards compatibility aliases)
  get nvidiaApiKey() { return this.aiApiKey; },
  set nvidiaApiKey(val: string) { this.aiApiKey = val; },
  get nvidiaModel() { return this.aiModel; },
  set nvidiaModel(val: string) { this.aiModel = val; },
  get nvidiaBaseUrl() { return this.aiBaseUrl; },
  set nvidiaBaseUrl(val: string) { this.aiBaseUrl = val; },
  get nvidiaTimeoutMs() { return this.aiTimeoutMs; },
  set nvidiaTimeoutMs(val: number) { this.aiTimeoutMs = val; },
  get nvidiaMaxTokens() { return this.aiMaxTokens; },
  set nvidiaMaxTokens(val: number) { this.aiMaxTokens = val; },

  // Optional external search provider keys for enterprise/production deployments
  braveApiKey: process.env.BRAVE_SEARCH_API_KEY || '',
  bingApiKey: process.env.BING_SEARCH_API_KEY || '',
  googleApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
  googleCx: process.env.GOOGLE_SEARCH_CX || '',
};
