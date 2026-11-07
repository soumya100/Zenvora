export type PrimaryIntent =
  | 'general'
  | 'images'
  | 'videos'
  | 'news'
  | 'it'
  | 'science'
  | 'navigational'
  | 'person'
  | 'entity';

export interface QueryIntent {
  primaryIntent: PrimaryIntent;
  subject: string;
  contentType?: string;
  qualityModifiers: string[];
  styleModifiers: string[];
  targetDevice?: string;
  isQuestion: boolean;
  isPerson?: boolean;
  isEntity?: boolean;
  entityType?: 'person' | 'organization' | 'place' | 'concept' | 'general';
  entityAttributes?: string[];
  rawQuery: string;
}

// Person and biographical patterns
const PERSON_PREFIX_PATTERNS = [
  /^(who\s+(?:is|was|are|were)|biography\s+of|bio\s+of|profile\s+of|life\s+of|history\s+of|facts\s+about|all\s+about)\s+/i,
];

const PERSON_HONORIFICS = [
  'dr', 'prof', 'professor', 'sir', 'lord', 'lady', 'mr', 'mrs', 'ms',
  'president', 'prime minister', 'ceo', 'founder', 'saint', 'pope',
  'king', 'queen', 'prince', 'princess', 'senator', 'governor', 'judge'
];

const PERSON_ATTRIBUTES = [
  'net worth', 'networth', 'wealth', 'salary', 'fortune',
  'age', 'birthday', 'birth date', 'born', 'died', 'death date',
  'spouse', 'wife', 'husband', 'partner', 'married to',
  'children', 'daughter', 'son', 'family', 'parents', 'father', 'mother',
  'education', 'college', 'university', 'alma mater', 'degree',
  'height', 'weight', 'nationality', 'religion',
  'career', 'awards', 'quotes', 'books', 'movies', 'songs', 'inventions'
];

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

  // 4b. Person & Entity Intent Detection
  let isPerson = false;
  let isEntity = false;
  let entityType: 'person' | 'organization' | 'place' | 'concept' | 'general' = 'general';
  const foundAttributes: string[] = [];

  // Detect explicit biographical prefixes ("who is X", "biography of X")
  let biographicalSubject: string | undefined;
  for (const prefixPat of PERSON_PREFIX_PATTERNS) {
    if (prefixPat.test(lower)) {
      isPerson = true;
      biographicalSubject = query.replace(prefixPat, '').replace(/[?.,!&]/g, '').trim();
      break;
    }
  }

  // Detect person honorifics ("dr", "prof", "president", "ceo")
  const hasHonorific = PERSON_HONORIFICS.some((h) => new RegExp(`\\b${h}\\b`, 'i').test(lower));
  if (hasHonorific) {
    isPerson = true;
  }

  // Detect person attribute inquiries ("elon musk net worth", "einstein birthday")
  for (const attr of PERSON_ATTRIBUTES) {
    const attrRegex = new RegExp(`\\b${attr}\\b`, 'i');
    if (attrRegex.test(lower)) {
      foundAttributes.push(attr);
      isPerson = true;
    }
  }

  // Detect 2-4 word proper name pattern (e.g. "Elon Musk", "Albert Einstein", "Taylor Swift", "Sundar Pichai")
  const words = query.split(/\s+/).filter(Boolean);
  const isLikelyProperName =
    words.length >= 2 &&
    words.length <= 4 &&
    !isNavigational &&
    !isWallpaper &&
    !isTech &&
    !isVideo &&
    !isScience &&
    !/\b(how|what|why|where|when|can|is|are|the|best|top|buy|cheap|download|free|online)\b/i.test(words[0]);

  if (isLikelyProperName) {
    isPerson = true;
  }

  if (isPerson) {
    isEntity = true;
    entityType = 'person';
    if (primaryIntent === 'general') {
      primaryIntent = 'person';
      contentType = 'biography';
    }
  }

  // 5. Question Detection
  const isQuestion = QUESTION_PATTERNS.some((pat) => pat.test(lower)) || query.endsWith('?');

  // 6. Core Subject Extraction
  // Strip out known modifiers, content types, prefixes and noise to isolate the main subject
  let cleanSubject = biographicalSubject || query;
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
    ...PERSON_ATTRIBUTES,
  ];

  for (const token of tokensToRemove) {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    cleanSubject = cleanSubject.replace(regex, ' ');
  }

  cleanSubject = cleanSubject.replace(/[?.,!&]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanSubject) {
    cleanSubject = query;
  }

  // Normalize proper name casing (e.g. "elon musk" -> "Elon Musk")
  if (isPerson && cleanSubject.length > 0) {
    cleanSubject = cleanSubject
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return {
    primaryIntent,
    subject: cleanSubject,
    contentType,
    qualityModifiers: foundQuality,
    styleModifiers: foundStyle,
    targetDevice,
    isQuestion,
    isPerson,
    isEntity,
    entityType,
    entityAttributes: foundAttributes,
    rawQuery: query,
  };
}
