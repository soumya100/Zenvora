import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Standard Search Rate Limiter (e.g. 60 req/min)
 */
export const searchRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests. Please slow down and try again shortly.',
    },
  },
  skip: () => config.env === 'test',
});

/**
 * Strict AI Chat & Intelligence Rate Limiter (e.g. 15 req/min)
 * Protects expensive LLM token consumption and compute.
 */
export const aiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitAiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please slow down and try again shortly.',
    },
  },
  skip: () => config.env === 'test',
});

/**
 * Image Proxy Rate Limiter (e.g. 60 req/min)
 */
export const imageProxyRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitImageProxyMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'IMAGE_PROXY_RATE_LIMIT_EXCEEDED',
      message: 'Too many image proxy requests. Please wait a moment.',
    },
  },
  skip: () => config.env === 'test',
});

/**
 * Health Endpoints Rate Limiter (e.g. 120 req/min)
 */
export const healthRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitHealthMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'HEALTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many health check requests.',
    },
  },
  skip: () => config.env === 'test',
});
