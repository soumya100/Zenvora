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

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  const message =
    statusCode === 500
      ? 'Search temporarily unavailable. Zenvora encountered an issue processing your request.'
      : err.message || 'An unexpected error occurred.';

  if (!config.isProduction && statusCode === 500) {
    console.error(`[Error] ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
