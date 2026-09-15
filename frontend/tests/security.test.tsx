import { describe, it, expect } from 'vitest';
import { getSafeUrl, isSafeUrl } from '../src/utils/security';

describe('Frontend URL Security & XSS Defense', () => {
  describe('getSafeUrl validation', () => {
    it('allows valid https URLs', () => {
      expect(getSafeUrl('https://example.com/test')).toBe('https://example.com/test');
      expect(getSafeUrl('https://en.wikipedia.org/wiki/Linux')).toBe(
        'https://en.wikipedia.org/wiki/Linux'
      );
      expect(isSafeUrl('https://example.com')).toBe(true);
    });

    it('allows valid http URLs', () => {
      expect(getSafeUrl('http://example.org')).toBe('http://example.org');
      expect(isSafeUrl('http://example.org')).toBe(true);
    });

    it('blocks dangerous javascript: pseudo-protocol', () => {
      expect(getSafeUrl('javascript:alert(1)')).toBe('#');
      expect(getSafeUrl('javascript:confirm(document.domain)')).toBe('#');
      expect(getSafeUrl('JAVASCRIPT:alert("xss")')).toBe('#');
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });

    it('blocks data: URIs that could execute scripts', () => {
      expect(getSafeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('blocks file: and vbscript: protocols', () => {
      expect(getSafeUrl('file:///etc/passwd')).toBe('#');
      expect(getSafeUrl('vbscript:msgbox(1)')).toBe('#');
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('handles empty, undefined, or null input gracefully', () => {
      expect(getSafeUrl('')).toBe('#');
      expect(getSafeUrl('   ')).toBe('#');
      expect(getSafeUrl(undefined)).toBe('#');
      expect(isSafeUrl(undefined)).toBe(false);
    });

    it('allows relative paths starting with /', () => {
      expect(getSafeUrl('/privacy')).toBe('/privacy');
      expect(getSafeUrl('/about')).toBe('/about');
      // But blocks protocol-relative URLs like //evil.com
      expect(getSafeUrl('//evil.com')).toBe('#');
    });
  });
});
