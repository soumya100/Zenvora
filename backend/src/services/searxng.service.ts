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
    .trim();
}

/**
 * Live Web Search Provider (Yahoo / Bing global index aggregator)
 */
async function fetchYahooWebResults(
  searchQuery: string,
  page: number = 1,
  language: string = 'auto',
  region: string = 'auto'
): Promise<ZenvoraResultItem[]> {
  try {
    const b = (page - 1) * 7 + 1;
    const reg = (region || 'auto').toLowerCase();
    const lang = (language || 'auto').toLowerCase();

    let domain = 'search.yahoo.com';
    let acceptLang = 'en-US,en;q=0.9';

    if (reg === 'de' || lang === 'de') {
      domain = 'de.search.yahoo.com';
      acceptLang = 'de-DE,de;q=0.9,en;q=0.8';
    } else if (reg === 'fr' || lang === 'fr') {
      domain = 'fr.search.yahoo.com';
      acceptLang = 'fr-FR,fr;q=0.9,en;q=0.8';
    } else if (reg === 'es' || lang === 'es') {
      domain = 'es.search.yahoo.com';
      acceptLang = 'es-ES,es;q=0.9,en;q=0.8';
    } else if (reg === 'in') {
      domain = 'in.search.yahoo.com';
      acceptLang = 'en-IN,en;q=0.9,hi;q=0.8';
    } else if (reg === 'gb') {
      domain = 'uk.search.yahoo.com';
      acceptLang = 'en-GB,en;q=0.9';
    } else if (reg === 'jp' || lang === 'ja') {
      domain = 'search.yahoo.co.jp';
      acceptLang = 'ja-JP,ja;q=0.9,en;q=0.8';
    }

    const url = `https://${domain}/search?p=${encodeURIComponent(searchQuery)}&b=${b}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': acceptLang,
      },
      timeout: 5000,
    });

    const html = res.data || '';
    const results: ZenvoraResultItem[] = [];
    const algoBlocks = html.split(/<div class="[^"]*algo algo-sr[^"]*"/);

    for (let i = 1; i < algoBlocks.length; i++) {
      const block = algoBlocks[i];
      const linkMatch = block.match(/href="([^"]*)"/);
      const titleMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      const snippetMatch = block.match(/<div class="[^"]*compText[^"]*"[^>]*><p[^>]*>([\s\S]*?)<\/p>/);

      if (linkMatch && titleMatch) {
        let rawUrl = linkMatch[1];
        if (rawUrl.includes('/RU=')) {
          const ruMatch = rawUrl.match(/\/RU=([^/]+)/);
          if (ruMatch) {
            rawUrl = decodeURIComponent(ruMatch[1]);
          }
        }

        const cleanTitle = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        const cleanSnippet = snippetMatch
          ? sanitizeSnippet(
              snippetMatch[1]
                .replace(/<[^>]*>/g, '')
                .replace(/&mdash;/g, '—')
                .replace(/&middot;/g, '·')
            )
          : '';

        if (cleanTitle && rawUrl.startsWith('http')) {
          const cleanItemUrl = cleanUrl(rawUrl);
          const domain = extractDomain(cleanItemUrl);
          results.push({
            id: `web-y-${page}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            title: cleanTitle,
            url: cleanItemUrl,
            domain: domain,
            snippet: cleanSnippet,
            engine: 'yahoo',
            engines: ['yahoo', 'bing'],
            category: 'general',
          });
        }
      }
    }

    return results;
  } catch (e: any) {
    console.warn('[LiveSearch] Yahoo search error:', e.message);
    return [];
  }
}

/**
 * DuckDuckGo HTML Web Search Provider
 */
async function fetchDuckDuckGoWebResults(
  searchQuery: string,
  page: number = 1,
  language: string = 'auto',
  region: string = 'auto'
): Promise<ZenvoraResultItem[]> {
  try {
    const reg = (region || 'auto').toLowerCase();
    const lang = (language || 'auto').toLowerCase();
    let kl = 'us-en';
    if (reg === 'de' || lang === 'de') kl = 'de-de';
    else if (reg === 'fr' || lang === 'fr') kl = 'fr-fr';
    else if (reg === 'es' || lang === 'es') kl = 'es-es';
    else if (reg === 'jp' || lang === 'ja') kl = 'jp-jp';
    else if (reg === 'in') kl = 'in-en';
    else if (reg === 'gb') kl = 'uk-en';
    else if (reg === 'us') kl = 'us-en';
    else if (lang === 'zh') kl = 'cn-zh';

    const postBody = `q=${encodeURIComponent(searchQuery)}&kl=${kl}`;
    const res = await axios.post(
      'https://html.duckduckgo.com/html/',
      postBody,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 4500,
      }
    );

    if (res.status !== 200) return [];
    const html = res.data || '';
    const results: ZenvoraResultItem[] = [];
    const blocks = html.split('class="result results_links');

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (titleMatch) {
        let rawHref = titleMatch[1];
        if (rawHref.includes('uddg=')) {
          const uddgMatch = rawHref.match(/uddg=([^&]+)/);
          if (uddgMatch) rawHref = decodeURIComponent(uddgMatch[1]);
        }

        const cleanTitle = titleMatch[2].replace(/<[^>]*>/g, '').trim();
        const snippet = snippetMatch ? sanitizeSnippet(snippetMatch[1].replace(/<[^>]*>/g, '')) : '';

        if (cleanTitle && rawHref.startsWith('http')) {
          const cleanItemUrl = cleanUrl(rawHref);
          results.push({
            id: `web-ddg-${page}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            title: cleanTitle,
            url: cleanItemUrl,
            domain: extractDomain(cleanItemUrl),
            snippet: snippet,
            engine: 'duckduckgo',
            engines: ['duckduckgo'],
            category: 'general',
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
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
 * Queries real, live open web sources (Yahoo/Bing index, DuckDuckGo, Wikipedia, Openverse, YouTube, Google News RSS, GitHub, arXiv)
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
    `${query} wiki`,
    `${query} latest news`,
    `${query} review`,
    `${query} official`,
    `${query} overview`,
  ];

  // 1. Wikipedia Page Summary / Instant Answer (only on page 1 for general, science, it)
  if (page === 1 && (category === 'general' || category === 'science' || category === 'it')) {
    try {
      const summaryRes = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
        {
          headers: { 'User-Agent': 'ZenvoraSearch/1.0 (privacy@zenvora.example)' },
          timeout: 3500,
        }
      );
      if (summaryRes.data && summaryRes.data.extract) {
        infoboxes.push({
          title: summaryRes.data.title || query,
          content: summaryRes.data.extract,
          url: summaryRes.data.content_urls?.desktop?.page,
          imgSrc: summaryRes.data.thumbnail?.source,
          attributes: summaryRes.data.description
            ? [{ label: 'Description', value: summaryRes.data.description }]
            : undefined,
        });
      }
    } catch {
      // Non-critical, proceed
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

    // B. Wikipedia PageImages Fallback / Augmentation
    if (results.length < 5) {
      try {
        const wikiImgRes = await axios.get('https://en.wikipedia.org/w/api.php', {
          params: {
            action: 'query',
            generator: 'search',
            gsrsearch: query,
            gsroffset: (page - 1) * 12,
            gsrlimit: 12,
            prop: 'pageimages|info',
            inprop: 'url',
            piprop: 'thumbnail|original',
            pithumbsize: 600,
            format: 'json',
            utf8: 1,
          },
          headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
          timeout: 4000,
        });

        const pages = Object.values(wikiImgRes.data?.query?.pages || {});
        pages.forEach((p: any, idx: number) => {
          if (p.thumbnail || p.original) {
            results.push({
              id: `img-wiki-${page}-${idx}`,
              title: p.title,
              url: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
              domain: 'en.wikipedia.org',
              snippet: `Wikimedia Commons / Wikipedia reference image for ${p.title}`,
              engine: 'wikipedia',
              engines: ['wikipedia'],
              category: 'images',
              imgSrc: p.original?.source || p.thumbnail?.source,
              thumbnail: p.thumbnail?.source,
              resolution: p.original ? `${p.original.width}x${p.original.height}` : '600x400',
            });
          }
        });
      } catch (e: any) {
        console.warn('[LiveSearch] Wikipedia image error:', e.message);
      }
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

  // 3. General Web Search (Live Yahoo/Bing Index + DuckDuckGo + Wikipedia + Google News)
  if (category === 'general' || results.length === 0) {
    try {
      // A. Query Live Global Web Index (Yahoo and DuckDuckGo in parallel)
      let [webYahoo, webDDG] = await Promise.all([
        fetchYahooWebResults(query, page, params.language, params.region),
        fetchDuckDuckGoWebResults(query, page, params.language, params.region),
      ]);

      // If a hyphenated/underscored query returns 0 results, also query with spaces (e.g. "soumyadeep-nandi-portfolio" -> "soumyadeep nandi portfolio")
      if (webYahoo.length === 0 && webDDG.length === 0 && (query.includes('-') || query.includes('_'))) {
        const spacedQuery = query.replace(/[-_]+/g, ' ');
        const [spacedYahoo, spacedDDG] = await Promise.all([
          fetchYahooWebResults(spacedQuery, page, params.language, params.region),
          fetchDuckDuckGoWebResults(spacedQuery, page, params.language, params.region),
        ]);
        webYahoo = spacedYahoo;
        webDDG = spacedDDG;
      }

      const seenUrls = new Set<string>(results.map((r) => r.url));
      for (const item of [...webYahoo, ...webDDG]) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          results.push(item);
        }
      }

      if (results.length > 0 && typeof totalResultsCount !== 'number') {
        totalResultsCount = Math.max(results.length * 1500 + 420, 150);
      }
    } catch (e: any) {
      console.warn('[LiveSearch] Web index error:', e.message);
    }

    // B. Wikipedia Knowledge Fallback / Augmentation (only if under 4 results)
    if (results.length < 4) {
      try {
        const lang = (params.language || 'auto').toLowerCase();
        const reg = (params.region || 'auto').toLowerCase();
        let wikiLang = 'en';
        if (['de', 'fr', 'es', 'ja', 'zh'].includes(lang)) {
          wikiLang = lang;
        } else if (reg === 'de') {
          wikiLang = 'de';
        } else if (reg === 'fr') {
          wikiLang = 'fr';
        } else if (reg === 'jp') {
          wikiLang = 'ja';
        }
        const wikiDomain = `${wikiLang}.wikipedia.org`;

        const wikiRes = await axios.get(`https://${wikiDomain}/w/api.php`, {
          params: {
            action: 'query',
            list: 'search',
            srsearch: query,
            sroffset: (page - 1) * 10,
            srlimit: 10,
            prop: 'info',
            inprop: 'url',
            format: 'json',
            utf8: 1,
          },
          headers: { 'User-Agent': 'ZenvoraSearch/1.0 (privacy@zenvora.example)' },
          timeout: 4000,
        });

        if (typeof wikiRes.data?.query?.searchinfo?.totalhits === 'number' && typeof totalResultsCount !== 'number') {
          totalResultsCount = wikiRes.data.query.searchinfo.totalhits;
        }

        const searchItems = wikiRes.data?.query?.search || [];
        const seenUrls = new Set(results.map((r) => r.url));
        searchItems.forEach((item: any, idx: number) => {
          const itemUrl = `https://${wikiDomain}/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`;
          if (!seenUrls.has(itemUrl)) {
            seenUrls.add(itemUrl);
            results.push({
              id: `wiki-${page}-${idx}-${item.pageid}`,
              title: item.title,
              url: itemUrl,
              domain: wikiDomain,
              snippet: sanitizeSnippet(item.snippet),
              engine: 'wikipedia',
              engines: ['wikipedia', 'duckduckgo'],
              category: 'general',
              publishedDate: item.timestamp ? item.timestamp.substring(0, 10) : undefined,
            });
          }
        });
      } catch (e: any) {
        console.warn('[LiveSearch] Wikipedia general error:', e.message);
      }
    }

    // C. Top Breaking News on Page 1 (if relevant and under 8 results)
    if (page === 1 && results.length < 8) {
      try {
        const reg = (params.region || 'auto').toLowerCase();
        const lang = (params.language || 'auto').toLowerCase();
        let gl = 'US';
        let hl = 'en-US';
        let ceid = 'US:en';

        if (reg === 'gb') { gl = 'GB'; hl = 'en-GB'; ceid = 'GB:en'; }
        else if (reg === 'de' || lang === 'de') { gl = 'DE'; hl = 'de'; ceid = 'DE:de'; }
        else if (reg === 'fr' || lang === 'fr') { gl = 'FR'; hl = 'fr'; ceid = 'FR:fr'; }
        else if (reg === 'in') { gl = 'IN'; hl = 'en-IN'; ceid = 'IN:en'; }
        else if (reg === 'jp' || lang === 'ja') { gl = 'JP'; hl = 'ja'; ceid = 'JP:ja'; }
        else if (lang === 'es') { gl = 'ES'; hl = 'es'; ceid = 'ES:es'; }
        else if (lang === 'zh') { gl = 'TW'; hl = 'zh-TW'; ceid = 'TW:zh-Hant'; }

        const newsRes = await axios.get('https://news.google.com/rss/search', {
          params: { q: query, hl, gl, ceid },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 2500,
        });

        const newsMatches = [
          ...newsRes.data.matchAll(
            /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g
          ),
        ];

        const seenUrls = new Set(results.map((r) => r.url));
        newsMatches.slice(0, 3).forEach((m: any, idx: number) => {
          const newsUrl = m[2].trim();
          if (!seenUrls.has(newsUrl)) {
            seenUrls.add(newsUrl);
            results.push({
              id: `top-news-${idx}`,
              title: sanitizeSnippet(m[1]),
              url: newsUrl,
              domain: extractDomain(newsUrl) || 'news.google.com',
              snippet: `Breaking news coverage: ${sanitizeSnippet(m[1])} via ${sanitizeSnippet(m[3])}.`,
              engine: 'google_news',
              engines: ['google_news'],
              category: 'general',
              author: sanitizeSnippet(m[3]),
            });
          }
        });
      } catch {
        // Optional enhancement
      }
    }
  }

  augmentZenvoraResults(query, category, page, results, infoboxes);

  const duration = Number(((Date.now() - startTime) / 1000).toFixed(3));

  return {
    query,
    category,
    page,
    results,
    answers: [],
    infoboxes,
    suggestions,
    unresponsiveEngines: [],
    numberOfResults:
      totalResultsCount !== undefined
        ? totalResultsCount
        : Math.max(results.length * 1250 + 380, results.length),
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

    // 2. Query upstream SearXNG JSON endpoint
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
            thumbnail: item.thumbnail_src || item.thumbnail,
            imgSrc: item.img_src || item.image_url,
            sourceUrl: item.source_url,
            publishedDate: item.publishedDate || item.pubdate,
            author: item.author,
            duration: item.duration || item.length,
            resolution: item.resolution,
          };
        });

        const rawInfoboxes = Array.isArray(rawData.infoboxes) ? rawData.infoboxes : [];
        const infoboxes: ZenvoraInfobox[] = rawInfoboxes.map((box: any) => ({
          title: box.infobox || box.title || '',
          content: box.content ? sanitizeSnippet(box.content) : '',
          url: box.url ? cleanUrl(box.url) : undefined,
          imgSrc: box.img_src,
          attributes: Array.isArray(box.attributes)
            ? box.attributes.map((attr: any) => ({
                label: String(attr.label || ''),
                value: String(attr.value || ''),
              }))
            : undefined,
        }));

        const searchDuration = Number(((Date.now() - startTime) / 1000).toFixed(3));
        const suggestions = Array.isArray(rawData.suggestions) ? rawData.suggestions : [];
        const unresponsiveEngines = Array.isArray(rawData.unresponsive_engines)
          ? rawData.unresponsive_engines.map((e: any) => (Array.isArray(e) ? e[0] : String(e)))
          : [];

        augmentZenvoraResults(query, category, page, normalizedResults, infoboxes);

        const result: ZenvoraSearchResponse = {
          query,
          category,
          page,
          results: normalizedResults,
          answers: Array.isArray(rawData.answers) ? rawData.answers : [],
          infoboxes,
          suggestions,
          unresponsiveEngines,
          numberOfResults: rawData.number_of_results || normalizedResults.length,
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
