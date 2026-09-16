import { z } from 'zod';

export const SearchCategoryEnum = z.enum([
  'general',
  'news',
  'images',
  'videos',
  'science',
  'it',
]);

export const SearchTypeEnum = z.enum(['web', 'images', 'news', 'videos', 'it', 'science']);

/**
 * Reusable schema for search queries.
 */
export const searchQuerySchema = z
  .object({
    q: z
      .string({ required_error: 'Query parameter "q" is required.' })
      .trim()
      .min(1, 'Query must not be empty.')
      .max(256, 'Query exceeds maximum allowed length of 256 characters.'),
    category: SearchCategoryEnum.optional().default('general'),
    type: SearchTypeEnum.optional(),
    page: z.coerce
      .number({ invalid_type_error: 'Page must be a valid number.' })
      .int('Page must be an integer.')
      .min(1, 'Page must be at least 1.')
      .max(100, 'Page cannot exceed 100.')
      .optional()
      .default(1),
    safesearch: z.coerce
      .number({ invalid_type_error: 'Safesearch must be a valid number.' })
      .int()
      .min(0, 'Safesearch must be 0, 1, or 2.')
      .max(2, 'Safesearch must be 0, 1, or 2.')
      .optional()
      .default(1),
    language: z
      .string()
      .trim()
      .max(15, 'Language code too long.')
      .regex(/^[a-zA-Z0-9_-]*$/, 'Invalid language format.')
      .optional()
      .default('auto'),
    region: z
      .string()
      .trim()
      .max(15, 'Region code too long.')
      .regex(/^[a-zA-Z0-9_-]*$/, 'Invalid region format.')
      .optional()
      .default('auto'),
    timeRange: z
      .enum(['', 'day', 'week', 'month', 'year'], {
        errorMap: () => ({ message: 'Invalid timeRange parameter.' }),
      })
      .optional()
      .default(''),
  })
  .strict(); // Rejects unexpected parameters to prevent parameter pollution

/**
 * Reusable schema for autocomplete query suggestions.
 */
export const suggestionQuerySchema = z
  .object({
    q: z
      .string({ required_error: 'Query parameter "q" is required.' })
      .trim()
      .min(1, 'Query must not be empty.')
      .max(100, 'Query exceeds maximum allowed length of 100 characters.'),
  })
  .strict();

/**
 * Reusable schema for SSRF-safe image proxy queries.
 */
export const imageProxyQuerySchema = z
  .object({
    url: z
      .string({ required_error: 'Target "url" parameter is required.' })
      .trim()
      .min(1, 'URL cannot be empty.')
      .max(2048, 'URL exceeds maximum length of 2048 characters.')
      .refine(
        (val) => {
          try {
            const parsed = new URL(val);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        { message: 'Only http and https protocols are supported.' }
      ),
  })
  .strict();

/**
 * Message schema for AI chat conversations.
 */
export const aiChatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant', 'system'], {
      errorMap: () => ({ message: 'Invalid role. Must be user, assistant, or system.' }),
    }),
    content: z
      .string({ required_error: 'Message content is required.' })
      .trim()
      .min(1, 'Message content must not be empty.')
      .max(1000, 'Message exceeds maximum length of 1000 characters.'),
  })
  .strict();

/**
 * AI Chat request body schema.
 */
export const aiChatRequestSchema = z
  .object({
    messages: z
      .array(aiChatMessageSchema)
      .min(1, 'At least one message is required.')
      .max(10, 'Conversation cannot exceed 10 messages.'),
    query: z
      .string()
      .trim()
      .max(256, 'Search query context cannot exceed 256 characters.')
      .optional(),
    stream: z.boolean().optional().default(false),
  })
  .strict();

/**
 * Structured schema for NVIDIA Nemotron query understanding responses.
 */
export const nemotronClassificationSchema = z.object({
  intent: z.enum(['web', 'images', 'news']),
  rewrittenQuery: z.string().trim().min(1).max(256),
  entities: z.array(z.string().trim().max(100)).max(10).default([]),
  constraints: z.array(z.string().trim().max(100)).max(10).default([]),
  confidence: z.number().min(0).max(1),
});

/**
 * Input source item for AI Overview generation.
 */
export const aiOverviewSourceInputSchema = z.object({
  title: z.string().trim().max(500),
  url: z.string().trim().max(2048),
  domain: z.string().trim().max(256).optional(),
  snippet: z.string().trim().max(2000).optional(),
});

/**
 * AI Overview request body schema.
 */
export const aiOverviewRequestSchema = z
  .object({
    query: z
      .string({ required_error: 'Query parameter "query" is required.' })
      .trim()
      .min(1, 'Query must not be empty.')
      .max(256, 'Query exceeds maximum allowed length of 256 characters.'),
    searchResults: z.array(aiOverviewSourceInputSchema).max(20).optional(),
    stream: z.boolean().optional().default(false),
  })
  .strict();

export type NemotronClassification = z.infer<typeof nemotronClassificationSchema>;
export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
export type ImageProxyQueryParams = z.infer<typeof imageProxyQuerySchema>;
export type AiChatRequestBody = z.infer<typeof aiChatRequestSchema>;
export type AiOverviewRequestBody = z.infer<typeof aiOverviewRequestSchema>;
export type AiOverviewSourceInput = z.infer<typeof aiOverviewSourceInputSchema>;

/**
 * Message schema for AI Overview conversation history.
 */
export const aiOverviewChatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z
      .string({ required_error: 'Content is required.' })
      .trim()
      .min(1, 'Content must not be empty.')
      .max(2000, 'Content exceeds 2000 characters.'),
  })
  .strict();

/**
 * AI Overview follow-up chat request body schema.
 */
export const aiOverviewChatRequestSchema = z
  .object({
    conversationId: z.string().trim().max(100).optional(),
    originalQuery: z
      .string({ required_error: 'originalQuery is required.' })
      .trim()
      .min(1, 'originalQuery must not be empty.')
      .max(256),
    message: z
      .string({ required_error: 'Message is required.' })
      .trim()
      .min(1, 'Message must not be empty.')
      .max(1000, 'Message exceeds 1000 characters.'),
    conversationHistory: z.array(aiOverviewChatMessageSchema).max(20).optional().default([]),
    searchResults: z.array(aiOverviewSourceInputSchema).max(20).optional(),
    stream: z.boolean().optional().default(false),
  })
  .strict();

export type AiOverviewChatMessage = z.infer<typeof aiOverviewChatMessageSchema>;
export type AiOverviewChatRequestBody = z.infer<typeof aiOverviewChatRequestSchema>;
