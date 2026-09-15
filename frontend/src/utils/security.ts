/**
 * Validates external URLs before rendering them into anchor tags or redirects.
 * Strictly allows only http: and https: protocols, completely blocking
 * javascript:, data:, file:, vbscript:, protocol-relative //, and malformed inputs.
 */
export function getSafeUrl(url?: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '#';
  }

  // Explicitly reject protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith('//')) {
    return '#';
  }

  // Explicitly allow safe local relative paths (e.g. /privacy, /about)
  if (trimmed.startsWith('/') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return '#';
  } catch {
    return '#';
  }
}

/**
 * Checks whether a URL is considered safe to navigate to.
 */
export function isSafeUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const safe = getSafeUrl(url);
  return safe !== '#' && !safe.toLowerCase().startsWith('javascript:');
}
