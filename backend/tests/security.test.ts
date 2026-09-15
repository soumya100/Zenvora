import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  isPrivateIPv4,
  isPrivateIPv6,
  isRestrictedIP,
  validateTargetUrl,
  ImageProxyError,
} from '../src/services/imageProxy.service';

describe('Security & SSRF Hardening Tests', () => {
  const app = createApp();

  describe('3.2 SSRF Protection & IP Blocklist', () => {
    it('blocks loopback IPv4 (127.0.0.1, 127.0.0.2)', () => {
      expect(isPrivateIPv4('127.0.0.1')).toBe(true);
      expect(isPrivateIPv4('127.0.0.254')).toBe(true);
    });

    it('blocks 0.0.0.0', () => {
      expect(isPrivateIPv4('0.0.0.0')).toBe(true);
    });

    it('blocks RFC 1918 10.0.0.0/8', () => {
      expect(isPrivateIPv4('10.0.0.1')).toBe(true);
      expect(isPrivateIPv4('10.254.254.254')).toBe(true);
    });

    it('blocks RFC 1918 172.16.0.0/12', () => {
      expect(isPrivateIPv4('172.16.0.1')).toBe(true);
      expect(isPrivateIPv4('172.25.10.5')).toBe(true);
      expect(isPrivateIPv4('172.31.255.255')).toBe(true);
      // Non-private 172.x should not be blocked
      expect(isPrivateIPv4('172.32.0.1')).toBe(false);
    });

    it('blocks RFC 1918 192.168.0.0/16', () => {
      expect(isPrivateIPv4('192.168.0.1')).toBe(true);
      expect(isPrivateIPv4('192.168.1.254')).toBe(true);
    });

    it('blocks link-local / AWS metadata (169.254.0.0/16)', () => {
      expect(isPrivateIPv4('169.254.169.254')).toBe(true);
      expect(isPrivateIPv4('169.254.1.1')).toBe(true);
    });

    it('blocks carrier-grade NAT (100.64.0.0/10)', () => {
      expect(isPrivateIPv4('100.64.0.1')).toBe(true);
      expect(isPrivateIPv4('100.127.255.255')).toBe(true);
      expect(isPrivateIPv4('100.63.255.255')).toBe(false);
    });

    it('blocks IPv6 loopback and unspecified', () => {
      expect(isPrivateIPv6('::1')).toBe(true);
      expect(isPrivateIPv6('::')).toBe(true);
    });

    it('blocks IPv6 private and unique local ranges (fc00::/7)', () => {
      expect(isPrivateIPv6('fc00::1')).toBe(true);
      expect(isPrivateIPv6('fd12:3456:789a::1')).toBe(true);
    });

    it('blocks IPv6 link-local (fe80::/10)', () => {
      expect(isPrivateIPv6('fe80::1')).toBe(true);
    });

    it('blocks IPv4-mapped IPv6 addresses for private IPv4', () => {
      expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateIPv6('::ffff:10.0.0.1')).toBe(true);
      expect(isPrivateIPv6('::ffff:192.168.1.1')).toBe(true);
    });

    it('allows public IPv4 addresses', () => {
      expect(isPrivateIPv4('8.8.8.8')).toBe(false);
      expect(isPrivateIPv4('1.1.1.1')).toBe(false);
      expect(isPrivateIPv4('93.184.216.34')).toBe(false);
    });
  });

  describe('3.2 Target URL Validation & SSRF Prevention', () => {
    it('rejects unsupported protocols (file:, ftp:, javascript:)', async () => {
      await expect(validateTargetUrl('file:///etc/passwd')).rejects.toThrow(
        /Only http and https protocols are supported/
      );
      await expect(validateTargetUrl('ftp://example.com/test.png')).rejects.toThrow(
        /Only http and https protocols are supported/
      );
      await expect(validateTargetUrl('javascript:alert(1)')).rejects.toThrow(
        /Only http and https protocols are supported/
      );
    });

    it('rejects URLs containing credentials (username:password@)', async () => {
      await expect(
        validateTargetUrl('https://user:pass@example.com/image.png')
      ).rejects.toThrow(/URLs containing credentials are not permitted/);
    });

    it('rejects localhost and 127.0.0.1', async () => {
      await expect(validateTargetUrl('http://localhost/image.png')).rejects.toThrow(
        /Access to internal hostnames is prohibited/
      );
      await expect(validateTargetUrl('http://127.0.0.1/image.png')).rejects.toThrow(
        /restricted private or internal range/
      );
    });

    it('rejects Docker service names (searxng, backend, redis, host.docker.internal)', async () => {
      await expect(validateTargetUrl('http://searxng:8080/image.png')).rejects.toThrow(
        /Access to internal hostnames is prohibited/
      );
      await expect(validateTargetUrl('http://backend:3000/image.png')).rejects.toThrow(
        /Access to internal hostnames is prohibited/
      );
      await expect(
        validateTargetUrl('http://host.docker.internal/image.png')
      ).rejects.toThrow(/Access to internal hostnames is prohibited/);
    });

    it('rejects internal network domains (.local, .internal, .lan)', async () => {
      await expect(
        validateTargetUrl('http://service.corp.internal/image.png')
      ).rejects.toThrow(/Access to internal network domains is prohibited/);
      await expect(
        validateTargetUrl('http://myrouter.lan/image.png')
      ).rejects.toThrow(/Access to internal network domains is prohibited/);
    });
  });

  describe('GET /api/image-proxy Endpoint SSRF Defense', () => {
    it('returns 400 when url parameter is missing', async () => {
      const res = await request(app).get('/api/image-proxy');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('INVALID_URL');
    });

    it('blocks request targeting 127.0.0.1', async () => {
      const res = await request(app).get('/api/image-proxy?url=http://127.0.0.1:3000/test.png');
      expect([400, 403]).toContain(res.status);
      expect(res.body.error).toBeDefined();
    });

    it('blocks request targeting localhost', async () => {
      const res = await request(app).get('/api/image-proxy?url=http://localhost:3000/test.png');
      expect([400, 403]).toContain(res.status);
      expect(res.body.error).toBeDefined();
    });

    it('blocks request targeting private IP 10.0.0.1', async () => {
      const res = await request(app).get('/api/image-proxy?url=http://10.0.0.1/test.png');
      expect([400, 403]).toContain(res.status);
      expect(res.body.error).toBeDefined();
    });

    it('blocks request with credentials in URL', async () => {
      const res = await request(app).get(
        '/api/image-proxy?url=https://admin:secret@example.com/test.png'
      );
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CREDENTIALS_PROHIBITED');
    });

    it('blocks request with unsupported protocol (file:)', async () => {
      const res = await request(app).get(
        '/api/image-proxy?url=file:///etc/passwd'
      );
      expect(res.status).toBe(400);
    });
  });

  describe('HTTP Method & Header Security', () => {
    it('rejects unsupported HTTP methods (DELETE, PUT, PATCH) with 405', async () => {
      const deleteRes = await request(app).delete('/api/search');
      expect(deleteRes.status).toBe(405);
      expect(deleteRes.body.error.code).toBe('METHOD_NOT_ALLOWED');

      const putRes = await request(app).put('/api/search');
      expect(putRes.status).toBe(405);
      expect(putRes.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('rejects POST requests with non-json Content-Type', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Content-Type', 'text/plain')
        .send('hello');
      expect(res.status).toBe(415);
      expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    });
  });

  describe('Privacy & Zero Query Logging', () => {
    it('does not log query parameters to console during search execution', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await request(app).get('/api/search?q=my+very+secret+medical+condition');

      // Verify none of the console log calls contained the query string
      for (const call of consoleSpy.mock.calls) {
        const logText = call.join(' ');
        expect(logText).not.toContain('my+very+secret+medical+condition');
        expect(logText).not.toContain('medical');
      }
      consoleSpy.mockRestore();
    });
  });

  describe('Production Error Shielding', () => {
    it('returns consistent JSON error format without stack traces', async () => {
      const res = await request(app).get('/api/nonexistent-route-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error).not.toHaveProperty('stack');
    });
  });
});
