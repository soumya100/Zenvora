import { Router, Request, Response, NextFunction } from 'express';
import { searchQuerySchema, suggestionQuerySchema } from '../schemas/validation';
import { searxngService } from '../services/searxng.service';
import { suggestionService } from '../services/suggestion.service';
import { aiService } from '../services/ai.service';
import { searchRateLimiter } from '../middleware/rateLimiter';
import { ZenvoraCategory } from '../types/search';

const router = Router();

/**
 * GET /api/search
 * Executes privacy-focused metasearch query with optional AI intent intelligence.
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

      let { q, category, type, page, safesearch, language, region, timeRange } = validation.data;

      // Map explicit user type selection to category if specified
      if (type) {
        if (type === 'images') category = 'images';
        else if (type === 'news') category = 'news';
        else if (type === 'web') category = 'general';
        else if (type === 'videos') category = 'videos';
        else if (type === 'it') category = 'it';
        else if (type === 'science') category = 'science';
      }

      // Check if user explicitly provided category/type in original query
      const explicitUserSelection = req.query.category !== undefined || req.query.type !== undefined;

      // Optional NVIDIA Nemotron query understanding (never overrides explicit user selection)
      let aiIntent: any = undefined;
      try {
        aiIntent = await aiService.classifyAndRewriteQuery(
          q,
          explicitUserSelection ? (category as string) : undefined
        );

        // If no explicit category was specified by user and Nemotron has high confidence for images,
        // we can adjust category if appropriate
        if (!explicitUserSelection && aiIntent && aiIntent.confidence >= 0.9) {
          if (aiIntent.intent === 'images') {
            // Keep general category to show web results + visual highlights strip
          }
        }
      } catch {
        // AI failure must never break ordinary search
      }

      const results = await searxngService.search({
        q,
        category: category as ZenvoraCategory,
        page,
        safesearch,
        language,
        region,
        timeRange,
      });

      // Augment with AI classification metadata if present
      if (aiIntent) {
        results.aiIntent = aiIntent;
      }

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
