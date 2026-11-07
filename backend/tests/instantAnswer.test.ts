import { describe, it, expect, beforeEach } from 'vitest';
import {
  InstantAnswerService,
  evaluateSafeMath,
} from '../src/services/instantAnswer.service';

describe('InstantAnswerService Unit Tests', () => {
  let service: InstantAnswerService;

  beforeEach(() => {
    service = new InstantAnswerService();
  });

  // ==========================================
  // 1. Math Expression Evaluator (Shunting-Yard)
  // ==========================================
  describe('evaluateSafeMath', () => {
    it('evaluates basic arithmetic operations', () => {
      expect(evaluateSafeMath('2 + 2')).toBe(4);
      expect(evaluateSafeMath('100 - 45')).toBe(55);
      expect(evaluateSafeMath('12 * 12')).toBe(144);
      expect(evaluateSafeMath('100 / 4')).toBe(25);
      expect(evaluateSafeMath('10 % 3')).toBe(1);
    });

    it('respects standard operator precedence and parentheses', () => {
      expect(evaluateSafeMath('2 + 3 * 4')).toBe(14);
      expect(evaluateSafeMath('(2 + 3) * 4')).toBe(20);
      expect(evaluateSafeMath('25 * 40 / 3')).toBeCloseTo(333.333333, 4);
      expect(evaluateSafeMath('((10 + 20) * 2) / (5 + 1)')).toBe(10);
    });

    it('evaluates percentage expressions like "15% of 850"', () => {
      expect(evaluateSafeMath('15% of 850')).toBe(127.5);
      expect(evaluateSafeMath('20% of 500')).toBe(100);
      expect(evaluateSafeMath('50% of 10')).toBe(5);
    });

    it('evaluates mathematical functions (sqrt, sin, cos, abs)', () => {
      expect(evaluateSafeMath('sqrt(144)')).toBe(12);
      expect(evaluateSafeMath('sqrt(25) + 10')).toBe(15);
      expect(evaluateSafeMath('abs(-42)')).toBe(42);
      expect(evaluateSafeMath('sin(0)')).toBe(0);
      expect(evaluateSafeMath('cos(0)')).toBe(1);
    });

    it('evaluates constants (pi, e)', () => {
      expect(evaluateSafeMath('pi')).toBeCloseTo(Math.PI, 6);
      expect(evaluateSafeMath('e')).toBeCloseTo(Math.E, 6);
      expect(evaluateSafeMath('2 * pi')).toBeCloseTo(2 * Math.PI, 6);
    });

    it('safely rejects malicious code injections and non-math syntax without using eval', () => {
      expect(evaluateSafeMath('process.exit(1)')).toBeNull();
      expect(evaluateSafeMath('console.log("hack")')).toBeNull();
      expect(evaluateSafeMath('require("fs")')).toBeNull();
      expect(evaluateSafeMath('<script>alert(1)</script>')).toBeNull();
      expect(evaluateSafeMath('hello world')).toBeNull();
    });

    it('handles division by zero gracefully without crashing', () => {
      expect(evaluateSafeMath('10 / 0')).toBeNull();
    });
  });

  // ==========================================
  // 2. Instant OneBox Resolution Pipeline
  // ==========================================
  describe('resolveInstantAnswer pipeline', () => {
    it('resolves calculator OneBox for arithmetic queries', async () => {
      const answer = await service.resolveInstantAnswer('25 * 40 / 3');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('calculator');
      expect(answer?.answer).toContain('333.333333');
      expect(answer?.icon).toBe('Calculator');
    });

    it('resolves currency conversion OneBox with rate subtext', async () => {
      const answer = await service.resolveInstantAnswer('100 USD to EUR');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('currency');
      expect(answer?.title).toContain('100 USD =');
      expect(answer?.answer).toMatch(/\d+(\.\d+)?\s*EUR/);
      expect(answer?.subtext).toContain('1 USD =');
      expect(answer?.icon).toBe('Coins');
    });

    it('resolves cryptocurrency conversion (BTC to USD)', async () => {
      const answer = await service.resolveInstantAnswer('1 BTC to USD');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('currency');
      expect(answer?.answer).toMatch(/\d+.*USD/);
    });

    it('resolves length unit conversion (10 km to miles)', async () => {
      const answer = await service.resolveInstantAnswer('10 km to miles');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('converter');
      expect(answer?.answer).toContain('6.21371 miles');
      expect(answer?.subtext).toContain('1 km =');
      expect(answer?.icon).toBe('Scale');
    });

    it('resolves mass unit conversion (50 lbs to kg)', async () => {
      const answer = await service.resolveInstantAnswer('50 lbs in kg');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('converter');
      expect(answer?.answer).toContain('kg');
    });

    it('resolves temperature conversion (100 C to F)', async () => {
      const answer = await service.resolveInstantAnswer('100 c to f');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('converter');
      expect(answer?.answer).toBe('212.00 °F');
    });

    it('resolves digital storage unit conversion (1024 mb to gb)', async () => {
      const answer = await service.resolveInstantAnswer('1024 mb to gb');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('converter');
      expect(answer?.answer).toBe('1 gb');
    });

    it('resolves world clock time for major global cities', async () => {
      const tokyo = await service.resolveInstantAnswer('time in Tokyo');
      expect(tokyo).not.toBeNull();
      expect(tokyo?.type).toBe('clock');
      expect(tokyo?.title).toBe('Time in Tokyo, Japan');
      expect(tokyo?.subtext).toContain('Asia/Tokyo');
      expect(tokyo?.icon).toBe('Clock');

      const london = await service.resolveInstantAnswer('current time in London');
      expect(london).not.toBeNull();
      expect(london?.type).toBe('clock');
      expect(london?.title).toBe('Time in London, United Kingdom');
    });

    it('resolves country capital direct facts', async () => {
      const answer = await service.resolveInstantAnswer('capital of France');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('fact');
      expect(answer?.title).toBe('Capital of France');
      expect(answer?.answer).toBe('Paris');
      expect(answer?.icon).toBe('MapPin');
    });

    it('resolves physical and scientific constants', async () => {
      const answer = await service.resolveInstantAnswer('speed of light');
      expect(answer).not.toBeNull();
      expect(answer?.type).toBe('fact');
      expect(answer?.answer).toContain('299,792,458 m/s');
    });

    it('returns null for standard web queries without direct answers', async () => {
      const answer = await service.resolveInstantAnswer('privacy search engine comparison');
      expect(answer).toBeNull();
    });
  });

  // ==========================================
  // 3. Spell Correction & Typo Detection
  // ==========================================
  describe('detectSpellingCorrection', () => {
    it('detects and corrects common misspelled person names', async () => {
      const correction = await service.detectSpellingCorrection('albrt einstien');
      expect(correction).not.toBeNull();
      expect(correction?.toLowerCase()).toBe('albert einstein');
    });

    it('detects and corrects programming typos', async () => {
      const correction = await service.detectSpellingCorrection('pythn docts');
      expect(correction).not.toBeNull();
      expect(correction?.toLowerCase()).toBe('python docs');
    });

    it('returns null when query has no typo or is already correct', async () => {
      const correction = await service.detectSpellingCorrection('albert einstein');
      expect(correction).toBeNull();
    });
  });

  // ==========================================
  // 4. "People Also Ask" Related Questions
  // ==========================================
  describe('generateRelatedQuestions', () => {
    it('generates biographical discovery questions for person queries', async () => {
      const questions = await service.generateRelatedQuestions('Elon Musk', {
        query: 'Elon Musk',
        primaryIntent: 'person',
        isPerson: true,
      } as any);
      expect(questions.length).toBeGreaterThanOrEqual(3);
      expect(questions.some((q) => q.toLowerCase().includes('net worth') || q.toLowerCase().includes('who is'))).toBe(true);
    });

    it('generates technical discovery questions for programming queries', async () => {
      const questions = await service.generateRelatedQuestions('Python programming', {
        query: 'Python programming',
        primaryIntent: 'it',
      } as any);
      expect(questions.length).toBeGreaterThanOrEqual(3);
      expect(questions.some((q) => q.toLowerCase().includes('how') || q.toLowerCase().includes('tutorials'))).toBe(true);
    });
  });
});
