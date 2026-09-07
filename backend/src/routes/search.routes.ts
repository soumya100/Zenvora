import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { searxngService } from '../services/searxng.service';
import { suggestionService } from '../services/suggestion.service';
import { searchRateLimiter } from '../middleware/rateLimiter';
import { ZenvoraCategory } from '../types/search';

const router = Router();

const searchQuerySchema = z.object({
  q: z
    .string({ required_error: 'Query parameter "q" is required.' })
    .trim()
    .min(1, 'Query must not be empty.')
    .max(256, 'Query exceeds maximum allowed length of 256 characters.'),
  category: z
    .enum(['general', 'news', 'images', 'videos', 'science', 'it'])
    .optional()
    .default('general'),
  page: z
    .coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .max(100, 'Page cannot exceed 100')
    .optional()
    .default(1),
  safesearch: z
    .coerce
    .number()
    .int()
    .min(0)
    .max(2)
    .optional()
    .default(1),
  language: z.string().max(10).optional().default('auto'),
  region: z.string().max(10).optional().default('auto'),
  timeRange: z.enum(['', 'day', 'week', 'month', 'year']).optional().default(''),
});

const suggestionQuerySchema = z.object({
  q: z
    .string({ required_error: 'Query parameter "q" is required.' })
    .trim()
    .min(1, 'Query must not be empty.')
    .max(100, 'Query exceeds maximum allowed length.'),
});

/**
 * GET /api/search
 * Executes privacy-focused metasearch query
 */
router.get(
  '/search',
  searchRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = searchQuerySchema.safeParse(req.query);

      if (!validation.success) {
        const errorDetails = validation.error.errors.map((e) => e.message).join(' ');
        res.status(400).json({
          error: {
            code: 'INVALID_QUERY',
            message: errorDetails,
          },
        });
        return;
      }

      const { q, category, page, safesearch, language, region, timeRange } = validation.data;

      const results = await searxngService.search({
        q,
        category: category as ZenvoraCategory,
        page,
        safesearch,
        language,
        region,
        timeRange,
      });

      res.json(results);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/suggestions
 * Returns fast search autocomplete suggestions
 */
router.get(
  '/suggestions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = suggestionQuerySchema.safeParse(req.query);

      if (!validation.success) {
        res.json({ query: '', suggestions: [] });
        return;
      }

      const { q } = validation.data;
      const suggestions = await suggestionService.getSuggestions(q);

      res.json({
        query: q,
        suggestions,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
