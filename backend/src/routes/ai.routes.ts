import { Router, Request, Response, NextFunction } from 'express';
import { aiChatRequestSchema } from '../schemas/validation';
import { aiService } from '../services/ai.service';
import { searxngService } from '../services/searxng.service';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { validateContentType } from '../middleware/security';

const router = Router();

/**
 * POST /api/ai/chat
 * Privacy-first AI assistant and search overview powered by NVIDIA Nemotron.
 * State is strictly client-side; zero queries or conversations are persisted.
 */
router.post(
  '/ai/chat',
  validateContentType,
  aiRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = aiChatRequestSchema.safeParse(req.body);
      if (!validation.success) {
        const errorDetails = validation.error.errors.map((e) => e.message).join(' ');
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: errorDetails,
          },
        });
        return;
      }

      const { messages, query, stream } = validation.data;

      // Extract fresh search evidence if query context is provided
      const searchEvidence: string[] = [];
      if (query && query.trim()) {
        try {
          const searchResult = await searxngService.search({
            q: query.trim(),
            category: 'general',
            page: 1,
          });

          if (searchResult && Array.isArray(searchResult.results)) {
            for (const item of searchResult.results.slice(0, 5)) {
              if (item.snippet) {
                searchEvidence.push(`${item.title}: ${item.snippet}`);
              }
            }
          }
        } catch {
          // If search evidence retrieval fails, proceed with chat context alone
        }
      }

      // Handle Server-Sent Events (SSE) streaming if requested
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        try {
          const aiResponse = await aiService.chatWithSearchContext(messages, searchEvidence);
          res.write(`data: ${JSON.stringify({ content: aiResponse.message })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        } catch (streamErr: any) {
          res.write(
            `data: ${JSON.stringify({
              error: { message: streamErr.message || 'AI streaming failed.' },
            })}\n\n`
          );
          res.end();
          return;
        }
      }

      // Non-streaming standard JSON response
      const aiResponse = await aiService.chatWithSearchContext(messages, searchEvidence);

      res.json({
        message: aiResponse.message,
        usage: aiResponse.usage,
      });
    } catch (err: any) {
      next(err);
    }
  }
);

export default router;
