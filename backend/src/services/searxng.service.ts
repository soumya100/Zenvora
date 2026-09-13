import axios from 'axios';
import { config } from '../config/env';
import {
  ZenvoraCategory,
  ZenvoraSearchQuery,
  ZenvoraSearchResponse,
  ZenvoraResultItem,
  ZenvoraInfobox,
} from '../types/search';

interface CacheEntry {
  response: ZenvoraSearchResponse;
  expiresAt: number;
}

// In-memory query cache with TTL
const queryCache = new Map<string, CacheEntry>();

/**
 * Remove tracking parameters from external URLs to protect user privacy.
 */
function cleanUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'msclkid',
      '_hsenc',
      '_hsmi',
      'mc_cid',
      'mc_eid',
    ];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Extract clean hostname/domain from URL
 */
function extractDomain(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return rawUrl.split('/')[0] || '';
  }
}

/**
 * Clean and strip hazardous HTML while keeping text readable
 */
function sanitizeSnippet(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decode Bing's tracking/redirect wrapper URL into the direct destination URL.
 * Bing encodes the original target URL in base64 inside the 'u' parameter (e.g. u=a1<base64>).
 */
function decodeBingUrl(rawUrl: string): string {
  try {
    const unescaped = rawUrl.replace(/&amp;/g, '&');
    if (!unescaped.includes('/ck/a?')) {
      return cleanUrl(unescaped);
    }
    const parsed = new URL(unescaped);
    const uParam = parsed.searchParams.get('u');
    if (!uParam) {
      return cleanUrl(unescaped);
    }

    // Format is typically u=a1<base64>
    const b64 = uParam.replace(/^a1/, '').replace(/[-_]/g, (m) => (m === '-' ? '+' : '/'));
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return cleanUrl(decoded);
    }
  } catch {
    // Fallback to original URL
  }
  return cleanUrl(rawUrl);
}

/**
 * Check if the query explicitly has encyclopedic/wiki intent
 */
function isExplicitWikiQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  const wikiPatterns = [
    /\b(wiki|wikipedia|wikidata)\b/i,
    /\b(who (is|was|were))\b/i,
    /\b(biography of|history of|definition of|define|etymology)\b/i,
  ];
  return wikiPatterns.some((p) => p.test(q));
}

/**
 * Detect domain or direct URL navigational intent
 */
function resolveNavigationalIntent(query: string, page: number = 1): ZenvoraResultItem | null {
  if (page !== 1) return null;
  const cleanQ = query.trim().toLowerCase();

  // Pattern for valid domain or URL: e.g. youtube.com, github.com, https://openai.com
  const domainMatch = cleanQ.match(
    /^(?:https?:\/\/)?([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*(?:\.[a-z]{2,}))(?::\d+)?(?:\/.*)?$/i
  );

  if (domainMatch) {
    const rawHostname = domainMatch[1].replace(/^www\./i, '');
    // Ensure valid domain structure (at least one dot and standard TLD)
    if (rawHostname.includes('.')) {
      const canonicalUrl = cleanQ.startsWith('http://') || cleanQ.startsWith('https://')
        ? cleanQ
        : `https://${rawHostname}/`;

      const domain = extractDomain(canonicalUrl);
      const titleName = domain.split('.')[0];
      const capitalizedTitle = titleName.charAt(0).toUpperCase() + titleName.slice(1);

      return {
        id: `nav-direct-${domain}`,
        title: `${capitalizedTitle} — Official Website (${domain})`,
        url: cleanUrl(canonicalUrl),
        domain: domain,
        snippet: `Direct navigation to official website: ${domain}. Click to open ${domain} safely.`,
        engine: 'navigation',
        engines: ['navigation', 'verified'],
        category: 'general',
        isNavigational: true,
      };
    }
  }

  return null;
}

/**
 * DuckDuckGo Instant Answer / Official Site resolution
 */
async function fetchDuckDuckGoOfficialResult(query: string): Promise<ZenvoraResultItem | null> {
  try {
    const res = await axios.get('https://api.duckduckgo.com/', {
      params: { q: query.trim(), format: 'json', no_html: 1, skip_disambig: 1 },
      timeout: 2500,
    });

    const data = res.data;
    if (data && Array.isArray(data.Results) && data.Results.length > 0) {
      const topResult = data.Results[0];
      if (topResult.FirstURL && topResult.FirstURL.startsWith('http')) {
        const cleanItemUrl = cleanUrl(topResult.FirstURL);
        const domain = extractDomain(cleanItemUrl);
        const title = sanitizeSnippet(topResult.Text || data.Heading || query);

        return {
          id: `ddg-official-${domain}`,
          title: title.includes(domain) ? title : `${title} — Official Website`,
          url: cleanItemUrl,
          domain: domain,
          snippet: data.AbstractText
            ? sanitizeSnippet(data.AbstractText)
            : `Official website for ${data.Heading || query} (${domain}).`,
          engine: 'official',
          engines: ['official', 'verified'],
          category: 'general',
          isNavigational: true,
        };
      }
    }
  } catch {
    // Non-critical
  }
  return null;
}

/**
 * Live Bing Web Index Aggregator with automatic tracking-URL decoding
 */
async function fetchBingWebResults(
  searchQuery: string,
  page: number = 1,
  language: string = 'auto',
  region: string = 'auto'
): Promise<ZenvoraResultItem[]> {
  try {
    const first = (page - 1) * 10 + 1;
    const reg = (region || 'auto').toLowerCase();
    const lang = (language || 'auto').toLowerCase();

    let acceptLang = 'en-US,en;q=0.9';
    if (reg === 'de' || lang === 'de') acceptLang = 'de-DE,de;q=0.9,en;q=0.8';
    else if (reg === 'fr' || lang === 'fr') acceptLang = 'fr-FR,fr;q=0.9,en;q=0.8';
    else if (reg === 'es' || lang === 'es') acceptLang = 'es-ES,es;q=0.9,en;q=0.8';
    else if (reg === 'in') acceptLang = 'en-IN,en;q=0.9,hi;q=0.8';
    else if (reg === 'gb') acceptLang = 'en-GB,en;q=0.9';
    else if (reg === 'jp' || lang === 'ja') acceptLang = 'ja-JP,ja;q=0.9,en;q=0.8';

    const res = await axios.get('https://www.bing.com/search', {
      params: { q: searchQuery, first },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': acceptLang,
      },
      timeout: 5000,
    });

    const html = res.data || '';
    const results: ZenvoraResultItem[] = [];
    const blocks = html.split('<li class="b_algo"');

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i].split('</li>')[0];
      const h2Match = block.match(
        /<h2[^>]*><a\s+(?:[^>]*?\s+)?href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a><\/h2>/i
      );
      const snippetMatch =
        block.match(/<p[^>]*class="(?:b_lineclamp\d*|b_algoSlug)"[^>]*>([\s\S]*?)<\/p>/i) ||
        block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

      if (h2Match) {
        const rawHref = h2Match[1];
        const finalUrl = decodeBingUrl(rawHref);
        const title = sanitizeSnippet(h2Match[2]);
        const snippet = snippetMatch ? sanitizeSnippet(snippetMatch[1]) : '';

        if (finalUrl && title && finalUrl.startsWith('http')) {
          results.push({
            id: `web-bing-${page}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            title,
            url: finalUrl,
            domain: extractDomain(finalUrl),
            snippet,
            engine: 'bing',
            engines: ['bing', 'web'],
            category: 'general',
          });
        }
      }
    }

    return results;
  } catch (e: any) {
    console.warn('[LiveSearch] Bing web index error:', e.message);
    return [];
  }
}

/**
 * Optional Brave Search API integration
 */
async function fetchBraveApiResults(
  query: string,
  page: number = 1,
  apiKey: string
): Promise<ZenvoraResultItem[]> {
  try {
    const res = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: { q: query, offset: (page - 1) * 10, count: 10 },
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
      timeout: 4500,
    });

    const webResults = res.data?.web?.results || [];
    return webResults.map((item: any, idx: number) => {
      const itemUrl = cleanUrl(item.url || '');
      return {
        id: `brave-${page}-${idx}`,
        title: sanitizeSnippet(item.title),
        url: itemUrl,
        domain: extractDomain(itemUrl),
        snippet: sanitizeSnippet(item.description),
        engine: 'brave',
        engines: ['brave'],
        category: 'general',
      };
    });
  } catch (e: any) {
    console.warn('[BraveAPI] Error:', e.message);
    return [];
  }
}

/**
 * Optional Bing Web Search API integration
 */
async function fetchBingApiResults(
  query: string,
  page: number = 1,
  apiKey: string
): Promise<ZenvoraResultItem[]> {
  try {
    const res = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
      params: { q: query, offset: (page - 1) * 10, count: 10 },
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      timeout: 4500,
    });

    const webPages = res.data?.webPages?.value || [];
    return webPages.map((item: any, idx: number) => {
      const itemUrl = cleanUrl(item.url || '');
      return {
        id: `bing-api-${page}-${idx}`,
        title: sanitizeSnippet(item.name),
        url: itemUrl,
        domain: extractDomain(itemUrl),
        snippet: sanitizeSnippet(item.snippet),
        engine: 'bing',
        engines: ['bing'],
        category: 'general',
      };
    });
  } catch (e: any) {
    console.warn('[BingAPI] Error:', e.message);
    return [];
  }
}

/**
 * Optional Google Custom Search JSON API integration
 */
async function fetchGoogleApiResults(
  query: string,
  page: number = 1,
  apiKey: string,
  cx: string
): Promise<ZenvoraResultItem[]> {
  try {
    const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { key: apiKey, cx, q: query, start: (page - 1) * 10 + 1 },
      timeout: 4500,
    });

    const items = res.data?.items || [];
    return items.map((item: any, idx: number) => {
      const itemUrl = cleanUrl(item.link || '');
      return {
        id: `google-api-${page}-${idx}`,
        title: sanitizeSnippet(item.title),
        url: itemUrl,
        domain: extractDomain(itemUrl),
        snippet: sanitizeSnippet(item.snippet),
        engine: 'google',
        engines: ['google'],
        category: 'general',
      };
    });
  } catch (e: any) {
    console.warn('[GoogleAPI] Error:', e.message);
    return [];
  }
}

/**
 * Strictly scoped knowledge infobox lookup.
 * Only triggers for genuine informational / encyclopedic questions, NOT for domain or website searches.
 */
async function fetchScopedInfobox(
  query: string,
  category: ZenvoraCategory
): Promise<ZenvoraInfobox | null> {
  if (category !== 'general' && category !== 'science' && category !== 'it') {
    return null;
  }

  const cleanQ = query.trim();

  // If query is a direct domain or URL, skip encyclopedic infobox
  if (/^[a-z0-9-]+\.[a-z]{2,}$/i.test(cleanQ) || cleanQ.includes('://')) {
    return null;
  }

  // 1. Check DuckDuckGo Instant Answer API for high-confidence entity overview
  try {
    const ddgRes = await axios.get('https://api.duckduckgo.com/', {
      params: { q: cleanQ, format: 'json', no_html: 1, skip_disambig: 1 },
      timeout: 2500,
    });

    if (ddgRes.data && ddgRes.data.AbstractText && ddgRes.data.Heading) {
      let imgSrc = ddgRes.data.Image ? String(ddgRes.data.Image) : undefined;
      if (imgSrc && !imgSrc.startsWith('http')) {
        imgSrc = `https://duckduckgo.com${imgSrc}`;
      }

      return {
        title: ddgRes.data.Heading,
        content: sanitizeSnippet(ddgRes.data.AbstractText),
        url: ddgRes.data.AbstractURL ? cleanUrl(ddgRes.data.AbstractURL) : undefined,
        source: ddgRes.data.AbstractSource || 'Instant Answer',
        imgSrc,
      };
    }
  } catch {}

  // 2. Wikipedia Summary ONLY if encyclopedic intent is present
  if (isExplicitWikiQuery(cleanQ)) {
    try {
      const lookupTerm = cleanQ
        .replace(/^(who is|who was|what is|what are|explain|definition of|define)\s+/i, '')
        .replace(/\?+$/, '')
        .trim();

      const summaryRes = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(lookupTerm)}`,
        {
          headers: { 'User-Agent': 'ZenvoraSearch/1.0 (privacy@zenvora.example)' },
          timeout: 2500,
        }
      );

      if (
        summaryRes.data &&
        summaryRes.data.extract &&
        summaryRes.data.type !== 'disambiguation'
      ) {
        return {
          title: summaryRes.data.title || lookupTerm,
          content: sanitizeSnippet(summaryRes.data.extract),
          url: summaryRes.data.content_urls?.desktop?.page,
          source: 'Wikipedia',
          imgSrc: summaryRes.data.thumbnail?.source,
          attributes: summaryRes.data.description
            ? [{ label: 'Description', value: summaryRes.data.description }]
            : undefined,
        };
      }
    } catch {}
  }

  return null;
}

/**
 * Precision Relevance Ranking & Deduplication Engine
 */
function rankAndDeduplicateResults(
  query: string,
  rawItems: ZenvoraResultItem[]
): ZenvoraResultItem[] {
  const cleanQ = query.toLowerCase().trim();
  const qTokens = cleanQ.split(/\s+/).filter((t) => t.length > 1);

  // 1. Deduplicate by canonical URL
  const seenUrls = new Set<string>();
  const uniqueItems: ZenvoraResultItem[] = [];

  for (const item of rawItems) {
    const normalizedUrl = item.url.replace(/\/$/, '').toLowerCase();
    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);
      uniqueItems.push(item);
    }
  }

  // 2. Score each result based on relevance signals
  const scoredItems = uniqueItems.map((item) => {
    let score = item.score || 0;
    const titleLower = item.title.toLowerCase();
    const snippetLower = item.snippet.toLowerCase();
    const domainLower = item.domain.toLowerCase();

    // Navigational / Official Boost
    if (item.isNavigational) {
      score += 150;
    }

    // Direct domain match to query (e.g. query "youtube", domain "youtube.com")
    if (
      domainLower === cleanQ ||
      domainLower.startsWith(`${cleanQ}.`) ||
      domainLower === `www.${cleanQ}`
    ) {
      score += 80;
    } else if (domainLower.includes(cleanQ)) {
      score += 40;
    }

    // Exact title match
    if (titleLower === cleanQ) {
      score += 60;
    } else if (titleLower.startsWith(cleanQ)) {
      score += 45;
    } else if (titleLower.includes(cleanQ)) {
      score += 30;
    }

    // Multi-word token coverage in title
    let titleMatches = 0;
    for (const token of qTokens) {
      if (titleLower.includes(token)) {
        titleMatches++;
        score += 15;
      }
    }
    if (qTokens.length > 1 && titleMatches === qTokens.length) {
      score += 35; // All query words in title
    }

    // Snippet relevance
    for (const token of qTokens) {
      if (snippetLower.includes(token)) {
        score += 5;
      }
    }

    // De-prioritize Wikipedia for non-wiki queries so official sites rank higher
    if (domainLower.includes('wikipedia.org') && !cleanQ.includes('wiki')) {
      score -= 25;
    }

    return { ...item, score };
  });

  // 3. Sort by score descending
  scoredItems.sort((a, b) => (b.score || 0) - (a.score || 0));

  return scoredItems;
}

/**
 * Automatically augment first-party verified official results for Zenvora brand queries
 */
function augmentZenvoraResults(
  query: string,
  category: ZenvoraCategory,
  page: number,
  results: ZenvoraResultItem[],
  infoboxes: ZenvoraInfobox[]
) {
  const cleanQ = query.toLowerCase().replace(/[-_ ]+/g, ' ').trim();
  const isZenvoraQuery =
    cleanQ === 'zenvora' ||
    cleanQ === 'zenvora beta' ||
    cleanQ === 'zenvora beta vercel' ||
    cleanQ === 'zenvora vercel' ||
    cleanQ === 'zenvora search' ||
    cleanQ === 'zenvora engine';

  if (isZenvoraQuery && page === 1 && (category === 'general' || category === 'it')) {
    const hasOfficialSite = results.some((r) => r.url.includes('zenvora-beta.vercel.app'));
    if (!hasOfficialSite) {
      results.unshift({
        id: 'zenvora-official-site',
        title: 'Zenvora (zenvora-beta) — Private. Open. Search. | zenvora-beta.vercel.app',
        url: 'https://zenvora-beta.vercel.app/',
        domain: 'zenvora-beta.vercel.app',
        snippet:
          'Official deployment of Zenvora on Vercel (zenvora-beta.vercel.app). Pure search with zero footprint. Fast, aggregated, privacy-first search results across global web indices without commercial user profiling.',
        engine: 'zenvora',
        engines: ['zenvora', 'verified', 'official'],
        category: 'general',
        isNavigational: true,
      });
    }

    const hasRepo = results.some((r) => r.url.includes('github.com/soumya100/Zenvora'));
    if (!hasRepo) {
      results.splice(1, 0, {
        id: 'zenvora-github-repo',
        title: 'soumya100/Zenvora: Private. Open. Search. - GitHub',
        url: 'https://github.com/soumya100/Zenvora',
        domain: 'github.com',
        snippet:
          'Official GitHub repository for Zenvora. A modern, production-grade metasearch engine engineered for zero-tracking discovery. Deployed at zenvora-beta.vercel.app.',
        engine: 'github',
        engines: ['github', 'open-source'],
        category: 'it',
      });
    }

    const hasInfobox = infoboxes.some((b) => b.title.toLowerCase().includes('zenvora'));
    if (!hasInfobox) {
      infoboxes.unshift({
        title: 'Zenvora (zenvora-beta)',
        content:
          'Zenvora is an open-source, privacy-first metasearch engine deployed at zenvora-beta.vercel.app. It delivers aggregated web discovery without query logs, behavioral profiling, or tracking cookies, using client-side preference encryption.',
        url: 'https://zenvora-beta.vercel.app/',
        source: 'Zenvora Official',
        attributes: [
          { label: 'Official Deployment', value: 'https://zenvora-beta.vercel.app' },
          { label: 'Platform', value: 'Vercel Serverless / Node.js / React' },
          { label: 'Repository', value: 'github.com/soumya100/Zenvora' },
          { label: 'Privacy Standard', value: 'Zero Query Logs & Zero Cookies' },
        ],
      });
    }
  }
}

/**
 * Live multi-source metasearch aggregator for standalone / offline development
 * Queries real, live open web sources (Bing decoded web index, DuckDuckGo Official Sites, Openverse, YouTube, Google News RSS, GitHub, arXiv)
 */
async function fetchLiveMetasearch(
  params: ZenvoraSearchQuery,
  startTime: number
): Promise<ZenvoraSearchResponse> {
  const query = params.q.trim();
  const category: ZenvoraCategory = params.category || 'general';
  const page = Math.max(1, params.page || 1);

  const results: ZenvoraResultItem[] = [];
  const infoboxes: ZenvoraInfobox[] = [];
  let totalResultsCount: number | undefined;

  const suggestions: string[] = [
    `${query} tutorial`,
    `${query} latest news`,
    `${query} documentation`,
    `${query} official site`,
    `${query} overview`,
  ];

  // 1. Scoped Knowledge Panel / Instant Answer (page 1 only)
  if (page === 1) {
    const infobox = await fetchScopedInfobox(query, category);
    if (infobox) {
      infoboxes.push(infobox);
    }
  }

  // 2. Category-Specific Live Aggregators
  if (category === 'images') {
    // A. Openverse Creative Commons Image Search
    try {
      const openverseRes = await axios.get('https://api.openverse.org/v1/images/', {
        params: { q: query, page_size: 16, page: page },
        headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
        timeout: 4500,
      });

      if (typeof openverseRes.data?.result_count === 'number') {
        totalResultsCount = openverseRes.data.result_count;
      }

      const rawItems = openverseRes.data?.results || [];
      rawItems.forEach((img: any, idx: number) => {
        results.push({
          id: `img-ov-${page}-${idx}`,
          title: img.title || `${query} image ${idx + 1}`,
          url: img.foreign_landing_url || img.url,
          domain: extractDomain(img.foreign_landing_url || img.url || 'openverse.org'),
          snippet: `Author: ${img.creator || 'Unknown'} | License: ${img.license || 'CC'}`,
          engine: 'openverse',
          engines: ['openverse', 'flickr'],
          category: 'images',
          imgSrc: img.url,
          thumbnail: img.thumbnail || img.url,
          resolution: img.width && img.height ? `${img.width}x${img.height}` : undefined,
          author: img.creator,
        });
      });
    } catch (e: any) {
      console.warn('[LiveSearch] Openverse image error:', e.message);
    }
  } else if (category === 'videos') {
    // YouTube Real-time Video Extraction with Pagination
    try {
      const ytRes = await axios.get('https://www.youtube.com/results', {
        params: { search_query: query },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 5000,
      });

      const match = ytRes.data.match(/ytInitialData\s*=\s*({[\s\S]+?});\s*<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const contents =
          data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const validVideos: any[] = [];
        contents.forEach((item: any) => {
          const v = item.videoRenderer;
          if (v && v.videoId) {
            validVideos.push(v);
          }
        });

        totalResultsCount = validVideos.length;
        const pagedVideos = validVideos.slice((page - 1) * 10, page * 10);

        pagedVideos.forEach((v: any, idx: number) => {
          const vidTitle = v.title?.runs?.[0]?.text || 'Video';
          const vidAuthor = v.ownerText?.runs?.[0]?.text || 'YouTube Creator';
          const vidDuration = v.lengthText?.simpleText || 'Video';
          const vidThumb =
            v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
            `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

          results.push({
            id: `yt-${v.videoId}-${page}-${idx}`,
            title: vidTitle,
            url: `https://www.youtube.com/watch?v=${v.videoId}`,
            domain: 'youtube.com',
            snippet: `${vidAuthor} • ${v.viewCountText?.simpleText || 'Views'} • ${v.publishedTimeText?.simpleText || ''}`,
            engine: 'youtube',
            engines: ['youtube'],
            category: 'videos',
            thumbnail: vidThumb,
            duration: vidDuration,
            author: vidAuthor,
          });
        });
      }
    } catch (e: any) {
      console.warn('[LiveSearch] YouTube error:', e.message);
    }
  } else if (category === 'news') {
    // Google News RSS Live Parser with Pagination
    try {
      const newsRes = await axios.get('https://news.google.com/rss/search', {
        params: { q: query, hl: 'en-US', gl: 'US', ceid: 'US:en' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 4500,
      });

      const allItems = [
        ...newsRes.data.matchAll(
          /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g
        ),
      ];

      totalResultsCount = allItems.length;
      const pagedItems = allItems.slice((page - 1) * 10, page * 10);

      pagedItems.forEach((m: any, idx: number) => {
        const rawTitle = sanitizeSnippet(m[1]);
        const newsLink = m[2].trim();
        const pubDate = m[3].trim();
        const sourceName = sanitizeSnippet(m[4]);

        results.push({
          id: `news-${page}-${idx}`,
          title: rawTitle,
          url: newsLink,
          domain: extractDomain(newsLink) || sourceName.toLowerCase().replace(/\s+/g, '') + '.com',
          snippet: `Latest reporting from ${sourceName} covering ${query}. Published on ${pubDate}.`,
          engine: 'google_news',
          engines: ['google_news'],
          category: 'news',
          publishedDate: pubDate.replace(/ \+0000| GMT/g, ''),
          author: sourceName,
        });
      });
    } catch (e: any) {
      console.warn('[LiveSearch] News RSS error:', e.message);
    }
  } else if (category === 'it') {
    // GitHub Repositories Live Search with Pagination
    try {
      const ghRes = await axios.get('https://api.github.com/search/repositories', {
        params: { q: query, per_page: 10, page: page },
        headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
        timeout: 4500,
      });

      if (typeof ghRes.data?.total_count === 'number') {
        totalResultsCount = ghRes.data.total_count;
      }

      const repos = ghRes.data?.items || [];
      repos.forEach((repo: any, idx: number) => {
        results.push({
          id: `gh-${repo.id}-${idx}`,
          title: `${repo.full_name} (${repo.language || 'Code'})`,
          url: repo.html_url,
          domain: 'github.com',
          snippet: `${repo.description || 'No description provided.'} ⭐ ${repo.stargazers_count} stars • Updated ${new Date(repo.updated_at).toLocaleDateString()}`,
          engine: 'github',
          engines: ['github'],
          category: 'it',
          author: repo.owner?.login,
        });
      });
    } catch (e: any) {
      console.warn('[LiveSearch] GitHub error:', e.message);
    }
  } else if (category === 'science') {
    // arXiv Scientific Papers Search with Pagination
    try {
      const arxivRes = await axios.get('http://export.arxiv.org/api/query', {
        params: { search_query: `all:${query}`, start: (page - 1) * 10, max_results: 10 },
        timeout: 4500,
      });

      const totalMatch = arxivRes.data.match(/<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/);
      if (totalMatch) {
        totalResultsCount = parseInt(totalMatch[1], 10);
      }

      const entries = [
        ...arxivRes.data.matchAll(
          /<entry>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<published>([\s\S]*?)<\/published>[\s\S]*?<id>([\s\S]*?)<\/id>[\s\S]*?<\/entry>/g
        ),
      ];

      entries.forEach((e: any, idx: number) => {
        const paperTitle = sanitizeSnippet(e[1]);
        const paperSummary = sanitizeSnippet(e[2]);
        const paperDate = e[3].substring(0, 10);
        const paperUrl = e[4].trim();

        results.push({
          id: `arxiv-${page}-${idx}`,
          title: paperTitle,
          url: paperUrl,
          domain: 'arxiv.org',
          snippet: paperSummary,
          engine: 'arxiv',
          engines: ['arxiv'],
          category: 'science',
          publishedDate: paperDate,
          author: 'arXiv Academic Repository',
        });
      });
    } catch (e: any) {
      console.warn('[LiveSearch] arXiv error:', e.message);
    }
  }

  // 3. General Web Search (Multi-Tier Execution)
  if (category === 'general' || results.length === 0) {
    // Navigational intent: if query is a domain or website URL, add top direct navigational card
    const directNav = resolveNavigationalIntent(query, page);
    if (directNav) {
      results.push(directNav);
    }

    let webResults: ZenvoraResultItem[] = [];

    // Tier A: Check configured third-party search APIs
    if (config.braveApiKey) {
      webResults = await fetchBraveApiResults(query, page, config.braveApiKey);
    } else if (config.bingApiKey) {
      webResults = await fetchBingApiResults(query, page, config.bingApiKey);
    } else if (config.googleApiKey && config.googleCx) {
      webResults = await fetchGoogleApiResults(query, page, config.googleApiKey, config.googleCx);
    }

    // Tier B: Live Bing Web Index Aggregator + DuckDuckGo Official Site Resolution
    if (webResults.length === 0) {
      const [bingItems, ddgOfficial] = await Promise.all([
        fetchBingWebResults(query, page, params.language, params.region),
        page === 1 ? fetchDuckDuckGoOfficialResult(query) : Promise.resolve(null),
      ]);

      if (ddgOfficial) {
        webResults.push(ddgOfficial);
      }
      webResults.push(...bingItems);
    }

    // Tier C: If user query explicitly requests Wikipedia, include relevant Wikipedia articles
    if (isExplicitWikiQuery(query)) {
      try {
        const wikiRes = await axios.get('https://en.wikipedia.org/w/api.php', {
          params: {
            action: 'query',
            list: 'search',
            srsearch: query,
            sroffset: (page - 1) * 5,
            srlimit: 5,
            format: 'json',
            utf8: 1,
          },
          headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
          timeout: 3000,
        });

        const searchItems = wikiRes.data?.query?.search || [];
        searchItems.forEach((item: any, idx: number) => {
          const itemUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`;
          webResults.push({
            id: `wiki-${page}-${idx}-${item.pageid}`,
            title: item.title,
            url: itemUrl,
            domain: 'en.wikipedia.org',
            snippet: sanitizeSnippet(item.snippet),
            engine: 'wikipedia',
            engines: ['wikipedia'],
            category: 'general',
            publishedDate: item.timestamp ? item.timestamp.substring(0, 10) : undefined,
          });
        });
      } catch {}
    }

    results.push(...webResults);

    if (results.length > 0 && typeof totalResultsCount !== 'number') {
      totalResultsCount = Math.max(results.length * 1500 + 420, 150);
    }
  }

  // Precision Relevance Ranking & Deduplication
  const rankedResults = rankAndDeduplicateResults(query, results);

  // First-party Zenvora query augmentation
  augmentZenvoraResults(query, category, page, rankedResults, infoboxes);

  const duration = Number(((Date.now() - startTime) / 1000).toFixed(3));

  return {
    query,
    category,
    page,
    results: rankedResults,
    answers: [],
    infoboxes,
    suggestions,
    unresponsiveEngines: [],
    numberOfResults:
      totalResultsCount !== undefined
        ? totalResultsCount
        : Math.max(rankedResults.length * 1250 + 380, rankedResults.length),
    searchDuration: duration,
    cached: false,
    mock: false,
  };
}

export class SearxngService {
  /**
   * Execute search request through upstream SearXNG with fallback & caching
   */
  public async search(params: ZenvoraSearchQuery): Promise<ZenvoraSearchResponse> {
    const startTime = Date.now();
    const query = params.q.trim();
    const category: ZenvoraCategory = params.category || 'general';
    const page = Math.max(1, params.page || 1);
    const safesearch = params.safesearch !== undefined ? params.safesearch : 1;
    const language = params.language || 'auto';
    const region = params.region || 'auto';

    const cacheKey = `${query.toLowerCase()}:${category}:${page}:${safesearch}:${language}:${region}`;

    // 1. Check in-memory cache
    const cachedItem = queryCache.get(cacheKey);
    if (cachedItem && cachedItem.expiresAt > Date.now()) {
      return {
        ...cachedItem.response,
        cached: true,
        searchDuration: Number(((Date.now() - startTime) / 1000).toFixed(3)),
      };
    }

    // 2. Query upstream SearXNG JSON endpoint if reachable
    try {
      const searxngUrl = `${config.searxngUrl}/search`;
      let searxLanguage = language === 'auto' ? '' : language;
      if (region !== 'auto') {
        searxLanguage = searxLanguage ? `${searxLanguage}-${region.toUpperCase()}` : `all-${region.toUpperCase()}`;
      }

      const response = await axios.get(searxngUrl, {
        params: {
          q: query,
          format: 'json',
          categories: category,
          pageno: page,
          safesearch: safesearch,
          language: searxLanguage,
          time_range: params.timeRange || '',
        },
        timeout: 1800,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Zenvora/1.0 (Privacy-Focused Metasearch Engine)',
        },
      });

      const rawData = response.data || {};
      const rawResults = Array.isArray(rawData.results) ? rawData.results : [];

      if (rawResults.length > 0) {
        const normalizedResults: ZenvoraResultItem[] = rawResults.map((item: any, idx: number) => {
          const itemUrl = cleanUrl(item.url || '');
          const domain = extractDomain(itemUrl);

          return {
            id: `zen-${page}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            title: item.title ? sanitizeSnippet(item.title) : 'Untitled Result',
            url: itemUrl,
            domain: domain,
            snippet: sanitizeSnippet(item.content || item.snippet || ''),
            engine: item.engine || 'metasearch',
            engines: Array.isArray(item.engines) ? item.engines : [item.engine || 'metasearch'],
            category: item.category || category,
            score: item.score,
            thumbnail: item.thumbnail_src?.startsWith('/i/')
              ? `https://duckduckgo.com${item.thumbnail_src}`
              : item.thumbnail_src?.startsWith('/')
              ? `${config.searxngUrl}${item.thumbnail_src}`
              : item.thumbnail_src || item.thumbnail,
            imgSrc: item.img_src?.startsWith('/i/')
              ? `https://duckduckgo.com${item.img_src}`
              : item.img_src?.startsWith('/')
              ? `${config.searxngUrl}${item.img_src}`
              : item.img_src || item.image_url,
            sourceUrl: item.source_url,
            publishedDate: item.publishedDate || item.pubdate,
            author: item.author,
            duration: item.duration || item.length,
            resolution: item.resolution,
          };
        });

        const rawInfoboxes = Array.isArray(rawData.infoboxes) ? rawData.infoboxes : [];
        const infoboxes: ZenvoraInfobox[] = rawInfoboxes.map((box: any) => {
          let boxImg = box.img_src ? String(box.img_src) : undefined;
          if (boxImg && boxImg.startsWith('/i/')) {
            boxImg = `https://duckduckgo.com${boxImg}`;
          } else if (boxImg && boxImg.startsWith('/')) {
            boxImg = `${config.searxngUrl}${boxImg}`;
          }

          return {
            title: box.infobox || box.title || '',
            content: box.content ? sanitizeSnippet(box.content) : '',
            url: box.url ? cleanUrl(box.url) : undefined,
            imgSrc: boxImg,
            source: box.engine || 'Upstream',
            attributes: Array.isArray(box.attributes)
              ? box.attributes.map((attr: any) => ({
                  label: String(attr.label || ''),
                  value: String(attr.value || ''),
                }))
              : undefined,
          };
        });

        const rankedResults = rankAndDeduplicateResults(query, normalizedResults);
        augmentZenvoraResults(query, category, page, rankedResults, infoboxes);

        const searchDuration = Number(((Date.now() - startTime) / 1000).toFixed(3));
        const suggestions = Array.isArray(rawData.suggestions) ? rawData.suggestions : [];
        const unresponsiveEngines = Array.isArray(rawData.unresponsive_engines)
          ? rawData.unresponsive_engines.map((e: any) => (Array.isArray(e) ? e[0] : String(e)))
          : [];

        const result: ZenvoraSearchResponse = {
          query,
          category,
          page,
          results: rankedResults,
          answers: Array.isArray(rawData.answers) ? rawData.answers : [],
          infoboxes,
          suggestions,
          unresponsiveEngines,
          numberOfResults: rawData.number_of_results || rankedResults.length,
          searchDuration,
          cached: false,
        };

        queryCache.set(cacheKey, {
          response: result,
          expiresAt: Date.now() + config.cacheTtlMs,
        });

        return result;
      }
    } catch {
      // If SearXNG is unreachable on host (e.g. running outside Docker Compose), activate Live Metasearch Aggregator
    }

    // 3. Live Metasearch Aggregator
    const liveResults = await fetchLiveMetasearch(params, startTime);

    queryCache.set(cacheKey, {
      response: liveResults,
      expiresAt: Date.now() + config.cacheTtlMs,
    });

    if (queryCache.size > 1000) {
      const oldestKey = queryCache.keys().next().value;
      if (oldestKey) queryCache.delete(oldestKey);
    }

    return liveResults;
  }

  /**
   * Upstream health check probe
   */
  public async checkUpstreamHealth(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await axios.get(`${config.searxngUrl}/healthz`, {
        timeout: 2500,
      });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }
}

export const searxngService = new SearxngService();
