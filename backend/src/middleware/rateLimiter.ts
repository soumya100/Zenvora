import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

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
