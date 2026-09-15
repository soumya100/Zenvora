import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
    },
  });
}

/**
 * Production-shielded error handler.
 * Strips internal stack traces, system paths, and upstream provider details.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const code = err.code || (statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

  let message = 'An unexpected error occurred.';

  if (statusCode === 500) {
    message = 'Search temporarily unavailable. Zenvora encountered an issue processing your request.';
  } else if (err.message && !err.message.includes('at ') && !err.message.includes('\\') && !err.message.includes('/')) {
    message = err.message;
  } else {
    message = 'Invalid request parameters.';
  }

  // Never log search queries or API keys
  if (!config.isProduction && statusCode === 500 && config.env !== 'test') {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
