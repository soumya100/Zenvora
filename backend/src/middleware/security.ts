import { Request, Response, NextFunction } from 'express';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'HEAD', 'OPTIONS']);

/**
 * Rejects unsupported HTTP methods with 405 Method Not Allowed.
 */
export function methodFilter(req: Request, res: Response, next: NextFunction): void {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS');
    res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `HTTP method ${req.method} is not supported.`,
      },
    });
    return;
  }
  next();
}

/**
 * Validates that POST requests declare an acceptable Content-Type (application/json).
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST') {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.toLowerCase().includes('application/json')) {
      res.status(415).json({
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Content-Type must be application/json.',
        },
      });
      return;
    }
  }
  next();
}
