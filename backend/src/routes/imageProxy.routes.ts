import { Router, Request, Response, NextFunction } from 'express';
import { imageProxyQuerySchema } from '../schemas/validation';
import { imageProxyService, ImageProxyError } from '../services/imageProxy.service';
import { imageProxyRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/image-proxy?url=...
 * SSRF-safe image proxy that fetches and streams external thumbnails/images
 * with DNS validation, private IP blocking, and safe content-type enforcement.
 */
router.get(
  '/image-proxy',
  imageProxyRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = imageProxyQuerySchema.safeParse(req.query);
      if (!validation.success) {
        const errorDetails = validation.error.errors.map((e) => e.message).join(' ');
        res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: errorDetails,
          },
        });
        return;
      }

      const { url } = validation.data;
      const result = await imageProxyService.fetchImage(url);

      res.setHeader('Content-Type', result.contentType);
      if (result.contentLength) {
        res.setHeader('Content-Length', result.contentLength.toString());
      }
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      result.stream.pipe(res);
    } catch (err: any) {
      if (err instanceof ImageProxyError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

export default router;
