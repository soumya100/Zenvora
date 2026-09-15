import http from 'http';
import https from 'https';
import dns from 'dns/promises';
import { URL } from 'url';

export interface ImageProxyResult {
  stream: NodeJS.ReadableStream;
  contentType: string;
  contentLength?: number;
}

export class ImageProxyError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 400, code = 'IMAGE_PROXY_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Blocked internal hostname patterns and Docker service names
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'searxng',
  'backend',
  'frontend',
  'redis',
  'caddy',
  'database',
  'db',
  'host.docker.internal',
  'gateway.docker.internal',
  'kubernetes.default',
  'metadata.google.internal',
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.corp',
  '.home',
  '.onion',
  '.docker',
];

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'image/bmp',
  'image/x-icon',
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const REQUEST_TIMEOUT_MS = 4000;

/**
 * Validates whether an IPv4 address belongs to a private, loopback,
 * link-local, carrier-grade NAT, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (RFC 1918 Private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-Local, AWS metadata)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;

  // 192.168.0.0/16 (RFC 1918 Private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use)
  if (a >= 240) return true;

  return false;
}

/**
 * Validates whether an IPv6 address belongs to loopback, unique local,
 * link-local, multicast, or IPv4-mapped private range.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // ::1 / Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // :: / Unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 address: ::ffff:192.0.2.128 or ::ffff:c000:0280
  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.replace('::ffff:', '');
    if (v4Part.includes('.')) {
      return isPrivateIPv4(v4Part);
    }
    // Hex IPv4 representation
    const hexParts = v4Part.split(':');
    if (hexParts.length === 2) {
      const p1 = parseInt(hexParts[0], 16);
      const p2 = parseInt(hexParts[1], 16);
      const a = (p1 >> 8) & 0xff;
      const b = p1 & 0xff;
      const c = (p2 >> 8) & 0xff;
      const d = p2 & 0xff;
      return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
    }
    return true;
  }

  // Unique Local Address (fc00::/7 -> fc00 to fdff)
  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return true;

  // Link-local unicast (fe80::/10 -> fe80 to febf)
  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return true;

  // Multicast (ff00::/8)
  if (normalized.startsWith('ff')) return true;

  // Discard / Documentation
  if (normalized.startsWith('100:') || normalized.startsWith('2001:db8:')) return true;

  return false;
}

/**
 * Determines if a resolved IP (IPv4 or IPv6) is restricted.
 */
export function isRestrictedIP(ip: string): boolean {
  if (ip.includes(':')) {
    return isPrivateIPv6(ip);
  }
  return isPrivateIPv4(ip);
}

/**
 * Validates a target URL and its resolved IP addresses against SSRF attack vectors.
 */
export async function validateTargetUrl(rawUrl: string): Promise<URL> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new ImageProxyError('Malformed URL provided.', 400, 'INVALID_URL');
  }

  // Protocol validation
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new ImageProxyError(
      'Only http and https protocols are supported.',
      400,
      'UNSUPPORTED_PROTOCOL'
    );
  }

  // Reject credentials in URL
  if (parsedUrl.username || parsedUrl.password) {
    throw new ImageProxyError(
      'URLs containing credentials are not permitted.',
      400,
      'CREDENTIALS_PROHIBITED'
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Reject empty hostname
  if (!hostname) {
    throw new ImageProxyError('Missing hostname in target URL.', 400, 'INVALID_HOSTNAME');
  }

  // Reject internal Docker and local hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new ImageProxyError('Access to internal hostnames is prohibited.', 403, 'SSRF_BLOCKED');
  }

  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      throw new ImageProxyError(
        'Access to internal network domains is prohibited.',
        403,
        'SSRF_BLOCKED'
      );
    }
  }

  // Direct IP checks (if hostname is an IPv4 or bracketed IPv6 literal)
  const cleanHost = hostname.replace(/^\[|\]$/g, '');
  if (isRestrictedIP(cleanHost)) {
    throw new ImageProxyError(
      'Target IP address resolves to a restricted private or internal range.',
      403,
      'SSRF_BLOCKED'
    );
  }

  // Perform DNS pre-resolution and validate every resolved IP address
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new ImageProxyError('Could not resolve hostname.', 400, 'DNS_LOOKUP_FAILED');
    }

    for (const record of addresses) {
      if (isRestrictedIP(record.address)) {
        throw new ImageProxyError(
          `Target hostname resolves to a restricted IP: ${record.address}`,
          403,
          'SSRF_BLOCKED'
        );
      }
    }
  } catch (err: any) {
    if (err instanceof ImageProxyError) throw err;
    throw new ImageProxyError(
      `DNS lookup failed for hostname: ${hostname}`,
      400,
      'DNS_RESOLUTION_ERROR'
    );
  }

  return parsedUrl;
}

export class ImageProxyService {
  /**
   * Fetches an image securely with DNS pinning, redirect checks,
   * size limits, and safe Content-Type enforcement.
   */
  public async fetchImage(
    rawUrl: string,
    redirectCount = 0
  ): Promise<ImageProxyResult> {
    if (redirectCount > 2) {
      throw new ImageProxyError('Too many redirects.', 400, 'TOO_MANY_REDIRECTS');
    }

    const validatedUrl = await validateTargetUrl(rawUrl);
    const isHttps = validatedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    return new Promise<ImageProxyResult>((resolve, reject) => {
      let isResolved = false;

      const req = requestModule.request(
        validatedUrl,
        {
          method: 'GET',
          timeout: REQUEST_TIMEOUT_MS,
          headers: {
            'User-Agent': 'Zenvora-ImageProxy/1.0 (Privacy-Safe Proxy)',
            Accept: 'image/webp,image/avif,image/jpeg,image/png,image/*;q=0.8',
          },
          lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { all: true })
              .then((addresses) => {
                if (!addresses || addresses.length === 0) {
                  return callback(new Error('DNS resolution failed'), '', 4);
                }
                for (const addr of addresses) {
                  if (isRestrictedIP(addr.address)) {
                    return callback(
                      new Error(`DNS Rebinding blocked for restricted IP: ${addr.address}`),
                      '',
                      4
                    );
                  }
                }
                const first = addresses[0];
                callback(null, first.address, first.family);
              })
              .catch((err) => callback(err, '', 4));
          },
        },
        async (res) => {
          // Handle HTTP redirects (301, 302, 303, 307, 308)
          if (
            res.statusCode &&
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location
          ) {
            req.destroy();
            try {
              const redirectUrl = new URL(res.headers.location, validatedUrl).toString();
              const result = await this.fetchImage(redirectUrl, redirectCount + 1);
              if (!isResolved) {
                isResolved = true;
                resolve(result);
              }
              return;
            } catch (redirectErr) {
              if (!isResolved) {
                isResolved = true;
                reject(redirectErr);
              }
              return;
            }
          }

          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            req.destroy();
            if (!isResolved) {
              isResolved = true;
              reject(
                new ImageProxyError(
                  `Upstream image server returned status ${res.statusCode}`,
                  res.statusCode === 404 ? 404 : 502,
                  'UPSTREAM_ERROR'
                )
              );
            }
            return;
          }

          // Content-Type validation
          const rawContentType = (res.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
          if (!ALLOWED_CONTENT_TYPES.has(rawContentType)) {
            req.destroy();
            if (!isResolved) {
              isResolved = true;
              reject(
                new ImageProxyError(
                  `Unsupported or hazardous content type: ${rawContentType || 'unknown'}. Only image formats are permitted.`,
                  415,
                  'UNSUPPORTED_MEDIA_TYPE'
                )
              );
            }
            return;
          }

          // Content-Length check (header)
          const rawContentLength = res.headers['content-length'];
          const contentLength = rawContentLength ? parseInt(rawContentLength, 10) : undefined;
          if (contentLength && contentLength > MAX_IMAGE_SIZE_BYTES) {
            req.destroy();
            if (!isResolved) {
              isResolved = true;
              reject(
                new ImageProxyError(
                  `Image exceeds maximum allowed size of ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB.`,
                  413,
                  'PAYLOAD_TOO_LARGE'
                )
              );
            }
            return;
          }

          // Monitor streaming bytes to prevent decompression bombs or unbounded streaming
          let totalBytes = 0;
          res.on('data', (chunk: Buffer) => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_IMAGE_SIZE_BYTES) {
              req.destroy();
              res.destroy(
                new ImageProxyError(
                  'Stream exceeded maximum image size limit.',
                  413,
                  'PAYLOAD_TOO_LARGE'
                )
              );
            }
          });

          if (!isResolved) {
            isResolved = true;
            resolve({
              stream: res,
              contentType: rawContentType,
              contentLength,
            });
          }
        }
      );

      req.on('timeout', () => {
        req.destroy();
        if (!isResolved) {
          isResolved = true;
          reject(
            new ImageProxyError('Image request timed out.', 504, 'UPSTREAM_TIMEOUT')
          );
        }
      });

      req.on('error', (err: any) => {
        if (!isResolved) {
          isResolved = true;
          reject(
            new ImageProxyError(
              err.message?.includes('SSRF') || err.message?.includes('DNS Rebinding')
                ? err.message
                : 'Failed to retrieve image from upstream server.',
              400,
              'CONNECTION_FAILED'
            )
          );
        }
      });

      req.end();
    });
  }
}

export const imageProxyService = new ImageProxyService();
