import { Router, Request, Response, NextFunction } from 'express';
import {
  aiChatRequestSchema,
  aiOverviewRequestSchema,
  aiOverviewChatRequestSchema,
} from '../schemas/validation';
import { aiService, normalizeOverviewSources } from '../services/ai.service';
import { searxngService } from '../services/searxng.service';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { validateContentType } from '../middleware/security';

const router = Router();

/**
 * Handler for AI Overview requests.
 * Supports both JSON response and Server-Sent Events (SSE) streaming.
 */
async function handleAiOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = aiOverviewRequestSchema.safeParse(req.body);
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

    const { query, searchResults, stream } = validation.data;

    // Gather candidate search results if not passed in request body
    let candidateResults = searchResults || [];
    if (candidateResults.length === 0) {
      try {
        const searchResult = await searxngService.search({
          q: query.trim(),
          category: 'general',
          page: 1,
        });
        if (searchResult && Array.isArray(searchResult.results)) {
          candidateResults = searchResult.results.slice(0, 10).map((r) => ({
            title: r.title,
            url: r.url,
            domain: r.domain,
            snippet: r.snippet,
          }));
        }
      } catch {
        // If SearXNG fails, proceed with candidateResults as empty
      }
    }

    // Generate grounded overview
    const overview = await aiService.generateAiOverview(query, candidateResults);

    // SSE Streaming response if requested
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      try {
        // 1. Send sources metadata event
        res.write(
          `data: ${JSON.stringify({
            type: 'sources',
            sources: overview.sources,
            status: overview.status,
          })}\n\n`
        );

        // 2. Stream answer content progressively
        const words = overview.answer.split(/(\s+)/);
        let accumulated = '';
        for (let i = 0; i < words.length; i += 4) {
          const chunk = words.slice(i, i + 4).join('');
          accumulated += chunk;
          res.write(
            `data: ${JSON.stringify({
              type: 'delta',
              delta: chunk,
              accumulated,
            })}\n\n`
          );
        }

        // 3. Send completion event
        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            query: overview.query,
            answer: overview.answer,
            sources: overview.sources,
            status: overview.status,
          })}\n\n`
        );
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

    // Standard JSON response
    res.json({
      query: overview.query,
      answer: overview.answer,
      sources: overview.sources,
      status: overview.status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/overview
 * Google-style grounded AI Overview for search results.
 */
router.post('/ai/overview', validateContentType, aiRateLimiter, handleAiOverview);

/**
 * POST /api/search/ai-overview (Convenience alias)
 */
router.post('/search/ai-overview', validateContentType, aiRateLimiter, handleAiOverview);

/**
 * Handler for AI Overview conversational follow-up questions.
 * Supports both JSON response and Server-Sent Events (SSE) streaming.
 */
async function handleAiOverviewChat(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = aiOverviewChatRequestSchema.safeParse(req.body);
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

    const { originalQuery, message, conversationHistory, searchResults, stream } = validation.data;
    const existingSources = searchResults ? normalizeOverviewSources(searchResults) : [];

    const result = await aiService.generateAiOverviewFollowUp({
      originalQuery,
      message,
      conversationHistory,
      existingSources,
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      try {
        // 1. Send sources metadata
        res.write(
          `data: ${JSON.stringify({
            type: 'sources',
            sources: result.sources,
            status: result.status,
          })}\n\n`
        );

        // 2. Stream answer delta progressively
        const words = result.reply.split(/(\s+)/);
        let accumulated = '';
        for (let i = 0; i < words.length; i += 4) {
          const chunk = words.slice(i, i + 4).join('');
          accumulated += chunk;
          res.write(
            `data: ${JSON.stringify({
              type: 'delta',
              delta: chunk,
              accumulated,
            })}\n\n`
          );
        }

        // 3. Send completion event
        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            reply: result.reply,
            sources: result.sources,
            status: result.status,
          })}\n\n`
        );
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (streamErr: any) {
        res.write(
          `data: ${JSON.stringify({
            error: { message: streamErr.message || 'AI follow-up streaming failed.' },
          })}\n\n`
        );
        res.end();
        return;
      }
    }

    // Standard JSON response
    res.json({
      reply: result.reply,
      sources: result.sources,
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/overview/chat
 * Conversational follow-up on top of AI Overview.
 */
router.post('/ai/overview/chat', validateContentType, aiRateLimiter, handleAiOverviewChat);

/**
 * POST /api/search/ai-overview/chat (Convenience alias)
 */
router.post('/search/ai-overview/chat', validateContentType, aiRateLimiter, handleAiOverviewChat);

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
