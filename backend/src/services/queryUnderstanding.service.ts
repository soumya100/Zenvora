export type PrimaryIntent =
  | 'general'
  | 'images'
  | 'videos'
  | 'news'
  | 'it'
  | 'science'
  | 'navigational';

export interface QueryIntent {
  primaryIntent: PrimaryIntent;
  subject: string;
  contentType?: string;
  qualityModifiers: string[];
  styleModifiers: string[];
  targetDevice?: string;
  isQuestion: boolean;
  rawQuery: string;
}

// Visual and wallpaper keyword patterns
const WALLPAPER_KEYWORDS = ['wallpaper', 'wallpapers', 'background', 'backgrounds', 'lockscreen', 'screensaver'];
const IMAGE_KEYWORDS = ['image', 'images', 'photo', 'photos', 'picture', 'pictures', 'pic', 'pics', 'fanart', 'artwork', 'art', 'poster', 'posters', 'illustration', 'illustrations', 'vector', 'render'];
const QUALITY_MODIFIERS = ['4k', '8k', 'uhd', 'ultra hd', '1080p', '720p', '1440p', '2k', 'hd', 'high res', 'high resolution', 'high quality'];
const STYLE_MODIFIERS = ['dark', 'black', 'amoled', 'minimal', 'minimalist', 'aesthetic', 'anime', 'cyberpunk', 'neon', 'vintage', 'retro', 'realistic', 'cinematic', '3d', 'abstract', 'nature'];
const DEVICE_MODIFIERS = ['desktop', 'pc', 'laptop', 'mobile', 'phone', 'iphone', 'android', 'widescreen', 'vertical', 'horizontal'];

// Video keywords
const VIDEO_KEYWORDS = ['video', 'videos', 'trailer', 'gameplay', 'walkthrough', 'clip', 'clips', 'movie clip', 'stream', 'full episode', 'highlight', 'highlights', 'yt'];

// News keywords
const NEWS_KEYWORDS = ['news', 'headline', 'headlines', 'breaking', 'latest update', 'today', 'press release', 'market report'];

// Tech / Programming / IT keywords
const TECH_KEYWORDS = ['documentation', 'docs', 'tutorial', 'tutorials', 'guide', 'github', 'npm', 'pypi', 'api', 'sdk', 'cheat sheet', 'syntax', 'library', 'framework', 'error', 'exception', 'stack overflow'];

// Academic / Science keywords
const SCIENCE_KEYWORDS = ['arxiv', 'paper', 'papers', 'research', 'journal', 'study', 'thesis', 'scholarly', 'theorem', 'equation'];

// Question prefixes
const QUESTION_PATTERNS = [
  /^(who|what|why|where|when|how|which|can|does|is|are|was|were)\s+/i,
  /\b(definition of|meaning of|how to|explain|what is|who is)\b/i,
];

// Known high-intent wallpaper domains
export const KNOWN_WALLPAPER_DOMAINS = [
  'wallpapercave.com',
  'wallpaperaccess.com',
  'wallpaperbat.com',
  'hdqwalls.com',
  'wallpaperflare.com',
  'alphacoders.com',
  'wallpapersden.com',
  'wallpapers.com',
  'wallhere.com',
  'getwallpapers.com',
  'wallpaperswide.com',
  'peakpx.com',
  'wallpaper Abyss',
  'artstation.com',
  'deviantart.com',
  'pinterest.com',
  'unsplash.com',
  'pexels.com',
];

/**
 * Analyzes and classifies the user query to determine genuine search intent,
 * extract the core entity/subject, and detect content/quality modifiers.
 */
export function parseQueryIntent(rawQuery: string): QueryIntent {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  // 1. Detect Quality Modifiers
  const foundQuality: string[] = [];
  for (const qMod of QUALITY_MODIFIERS) {
    const regex = new RegExp(`\\b${qMod}\\b`, 'i');
    if (regex.test(lower)) {
      foundQuality.push(qMod);
    }
  }

  // 2. Detect Style Modifiers
  const foundStyle: string[] = [];
  for (const sMod of STYLE_MODIFIERS) {
    const regex = new RegExp(`\\b${sMod}\\b`, 'i');
    if (regex.test(lower)) {
      foundStyle.push(sMod);
    }
  }

  // 3. Detect Device Target
  let targetDevice: string | undefined;
  for (const dev of DEVICE_MODIFIERS) {
    const regex = new RegExp(`\\b${dev}\\b`, 'i');
    if (regex.test(lower)) {
      targetDevice = dev;
      break;
    }
  }

  // 4. Detect Content Type & Primary Intent
  let primaryIntent: PrimaryIntent = 'general';
  let contentType: string | undefined;

  const isWallpaper = WALLPAPER_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const isImage = IMAGE_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const isVideo = VIDEO_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const isNews = NEWS_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const isTech = TECH_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const isScience = SCIENCE_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));

  // Navigational intent (domain or direct URL)
  const isNavigational = /^[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(query) || lower.includes('://');

  if (isWallpaper) {
    primaryIntent = 'images';
    contentType = 'wallpapers';
  } else if (isImage && (foundQuality.length > 0 || foundStyle.length > 0)) {
    primaryIntent = 'images';
    contentType = 'images';
  } else if (isVideo) {
    primaryIntent = 'videos';
    contentType = 'video';
  } else if (isNews) {
    primaryIntent = 'news';
    contentType = 'news';
  } else if (isTech) {
    primaryIntent = 'it';
    contentType = 'technical';
  } else if (isScience) {
    primaryIntent = 'science';
    contentType = 'academic';
  } else if (isNavigational) {
    primaryIntent = 'navigational';
  }

  // 5. Question Detection
  const isQuestion = QUESTION_PATTERNS.some((pat) => pat.test(lower)) || query.endsWith('?');

  // 6. Core Subject Extraction
  // Strip out known modifiers, content types, and noise to isolate the main subject
  let cleanSubject = query;
  const tokensToRemove = [
    ...WALLPAPER_KEYWORDS,
    ...IMAGE_KEYWORDS,
    ...VIDEO_KEYWORDS,
    ...NEWS_KEYWORDS,
    ...TECH_KEYWORDS,
    ...SCIENCE_KEYWORDS,
    ...QUALITY_MODIFIERS,
    ...STYLE_MODIFIERS,
    ...DEVICE_MODIFIERS,
  ];

  for (const token of tokensToRemove) {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    cleanSubject = cleanSubject.replace(regex, ' ');
  }

  cleanSubject = cleanSubject.replace(/[?.,!&]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanSubject) {
    cleanSubject = query;
  }

  return {
    primaryIntent,
    subject: cleanSubject,
    contentType,
    qualityModifiers: foundQuality,
    styleModifiers: foundStyle,
    targetDevice,
    isQuestion,
    rawQuery: query,
  };
}
