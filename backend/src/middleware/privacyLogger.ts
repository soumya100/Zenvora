import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Privacy-preserving request logger.
 * Strips all query strings, fragments, and sensitive parameters to guarantee
 * zero persistent logging of search queries or user search history.
 */
export function privacyLogger(req: Request, res: Response, next: NextFunction): void {
  if (config.env === 'test') {
    return next();
  }

  const startTime = Date.now();
  // Strip query string completely to preserve query privacy
  const sanitizedPath = (req.originalUrl || req.url || '').split('?')[0];

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;

    // Production log format: only method, path, status, and duration
    // No IP logging, no User-Agent profiling, no query string
    if (config.isProduction) {
      if (statusCode >= 400) {
        console.log(`[HTTP] ${method} ${sanitizedPath} ${statusCode} ${durationMs}ms`);
      }
    } else {
      console.log(`[HTTP] ${method} ${sanitizedPath} ${statusCode} ${durationMs}ms`);
    }
  });

  next();
}
