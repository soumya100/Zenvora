import axios from 'axios';
import { ZenvoraDirectAnswer } from '../types/search';
import { QueryIntent } from './queryUnderstanding.service';

// In-memory cache for currency exchange rates
interface ExchangeCache {
  rates: Record<string, number>;
  timestamp: number;
}
let currencyCache: ExchangeCache | null = null;
const CURRENCY_CACHE_TTL = 3600 * 1000; // 1 hour

// Default fallback currency rates (relative to USD)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.4,
  JPY: 155.2,
  CAD: 1.36,
  AUD: 1.51,
  CHF: 0.90,
  CNY: 7.23,
  SGD: 1.35,
  HKD: 7.81,
  NZD: 1.64,
  BRL: 5.15,
  MXN: 16.9,
  KRW: 1360,
  AED: 3.67,
  SAR: 3.75,
  TRY: 32.2,
  ZAR: 18.5,
  SEK: 10.7,
  NOK: 10.8,
  BTC: 0.000015,
  ETH: 0.00032,
  SOL: 0.0068,
};

// Global City to IANA Timezone mapping
const CITY_TIMEZONES: Record<string, { zone: string; city: string; country: string }> = {
  'tokyo': { zone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
  'japan': { zone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
  'london': { zone: 'Europe/London', city: 'London', country: 'United Kingdom' },
  'uk': { zone: 'Europe/London', city: 'London', country: 'United Kingdom' },
  'new york': { zone: 'America/New_York', city: 'New York', country: 'United States' },
  'nyc': { zone: 'America/New_York', city: 'New York', country: 'United States' },
  'los angeles': { zone: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' },
  'la': { zone: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' },
  'california': { zone: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' },
  'san francisco': { zone: 'America/Los_Angeles', city: 'San Francisco', country: 'United States' },
  'chicago': { zone: 'America/Chicago', city: 'Chicago', country: 'United States' },
  'paris': { zone: 'Europe/Paris', city: 'Paris', country: 'France' },
  'france': { zone: 'Europe/Paris', city: 'Paris', country: 'France' },
  'berlin': { zone: 'Europe/Berlin', city: 'Berlin', country: 'Germany' },
  'germany': { zone: 'Europe/Berlin', city: 'Berlin', country: 'Germany' },
  'rome': { zone: 'Europe/Rome', city: 'Rome', country: 'Italy' },
  'italy': { zone: 'Europe/Rome', city: 'Rome', country: 'Italy' },
  'madrid': { zone: 'Europe/Madrid', city: 'Madrid', country: 'Spain' },
  'spain': { zone: 'Europe/Madrid', city: 'Madrid', country: 'Spain' },
  'sydney': { zone: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
  'melbourne': { zone: 'Australia/Melbourne', city: 'Melbourne', country: 'Australia' },
  'australia': { zone: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
  'dubai': { zone: 'Asia/Dubai', city: 'Dubai', country: 'United Arab Emirates' },
  'uae': { zone: 'Asia/Dubai', city: 'Dubai', country: 'United Arab Emirates' },
  'india': { zone: 'Asia/Kolkata', city: 'New Delhi', country: 'India' },
  'delhi': { zone: 'Asia/Kolkata', city: 'New Delhi', country: 'India' },
  'mumbai': { zone: 'Asia/Kolkata', city: 'Mumbai', country: 'India' },
  'bengaluru': { zone: 'Asia/Kolkata', city: 'Bengaluru', country: 'India' },
  'singapore': { zone: 'Asia/Singapore', city: 'Singapore', country: 'Singapore' },
  'hong kong': { zone: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'China' },
  'beijing': { zone: 'Asia/Shanghai', city: 'Beijing', country: 'China' },
  'shanghai': { zone: 'Asia/Shanghai', city: 'Shanghai', country: 'China' },
  'china': { zone: 'Asia/Shanghai', city: 'Beijing', country: 'China' },
  'seoul': { zone: 'Asia/Seoul', city: 'Seoul', country: 'South Korea' },
  'south korea': { zone: 'Asia/Seoul', city: 'Seoul', country: 'South Korea' },
  'toronto': { zone: 'America/Toronto', city: 'Toronto', country: 'Canada' },
  'vancouver': { zone: 'America/Vancouver', city: 'Vancouver', country: 'Canada' },
  'canada': { zone: 'America/Toronto', city: 'Ottawa', country: 'Canada' },
  'moscow': { zone: 'Europe/Moscow', city: 'Moscow', country: 'Russia' },
  'russia': { zone: 'Europe/Moscow', city: 'Moscow', country: 'Russia' },
  'cairo': { zone: 'Africa/Cairo', city: 'Cairo', country: 'Egypt' },
  'egypt': { zone: 'Africa/Cairo', city: 'Cairo', country: 'Egypt' },
  'johannesburg': { zone: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa' },
  'south africa': { zone: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa' },
  'sao paulo': { zone: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil' },
  'brazil': { zone: 'America/Sao_Paulo', city: 'Brasília', country: 'Brazil' },
  'buenos aires': { zone: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina' },
  'argentina': { zone: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina' },
  'amsterdam': { zone: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands' },
  'netherlands': { zone: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands' },
  'zurich': { zone: 'Europe/Zurich', city: 'Zurich', country: 'Switzerland' },
  'switzerland': { zone: 'Europe/Zurich', city: 'Bern', country: 'Switzerland' },
};

// Global Capital Cities Database
const COUNTRY_CAPITALS: Record<string, string> = {
  'france': 'Paris',
  'germany': 'Berlin',
  'united kingdom': 'London',
  'uk': 'London',
  'england': 'London',
  'united states': 'Washington, D.C.',
  'usa': 'Washington, D.C.',
  'canada': 'Ottawa',
  'japan': 'Tokyo',
  'india': 'New Delhi',
  'china': 'Beijing',
  'australia': 'Canberra',
  'italy': 'Rome',
  'spain': 'Madrid',
  'brazil': 'Brasília',
  'russia': 'Moscow',
  'south korea': 'Seoul',
  'mexico': 'Mexico City',
  'egypt': 'Cairo',
  'south africa': 'Pretoria, Cape Town, Bloemfontein',
  'argentina': 'Buenos Aires',
  'switzerland': 'Bern',
  'netherlands': 'Amsterdam',
  'sweden': 'Stockholm',
  'norway': 'Oslo',
  'denmark': 'Copenhagen',
  'finland': 'Helsinki',
  'poland': 'Warsaw',
  'portugal': 'Lisbon',
  'greece': 'Athens',
  'turkey': 'Ankara',
  'saudi arabia': 'Riyadh',
  'uae': 'Abu Dhabi',
  'united arab emirates': 'Abu Dhabi',
  'singapore': 'Singapore',
  'thailand': 'Bangkok',
  'indonesia': 'Jakarta (Nusantara)',
  'vietnam': 'Hanoi',
  'philippines': 'Manila',
  'malaysia': 'Kuala Lumpur',
  'new zealand': 'Wellington',
  'ireland': 'Dublin',
  'austria': 'Vienna',
  'belgium': 'Brussels',
  'colombia': 'Bogotá',
  'chile': 'Santiago',
  'peru': 'Lima',
  'pakistan': 'Islamabad',
  'bangladesh': 'Dhaka',
  'nigeria': 'Abuja',
  'kenya': 'Nairobi',
};

// Common Scientific & Physical Constants
const CONSTANTS_FACTS: Record<string, { value: string; desc: string }> = {
  'speed of light': { value: '299,792,458 m/s', desc: 'Exact speed of light in vacuum (c)' },
  'light speed': { value: '299,792,458 m/s', desc: 'Speed of light in vacuum (c)' },
  'acceleration due to gravity': { value: '9.80665 m/s²', desc: 'Standard Earth surface gravity (g)' },
  'earth gravity': { value: '9.80665 m/s²', desc: 'Standard Earth gravitational acceleration' },
  'gravitational constant': { value: '6.67430 × 10⁻¹¹ N⋅m²/kg²', desc: 'Newtonian constant of gravitation (G)' },
  'planck constant': { value: '6.62607015 × 10⁻³⁴ J⋅s', desc: 'Planck constant (h)' },
  'avogadro number': { value: '6.02214076 × 10²³ mol⁻¹', desc: 'Avogadro constant (N_A)' },
  'avogadro constant': { value: '6.02214076 × 10²³ mol⁻¹', desc: 'Avogadro constant (N_A)' },
  'boltzmann constant': { value: '1.380649 × 10⁻²³ J/K', desc: 'Boltzmann constant (k_B)' },
  'pi': { value: '3.141592653589793...', desc: 'Mathematical ratio of circumference to diameter' },
  'euler number': { value: '2.718281828459045...', desc: 'Base of the natural logarithm (e)' },
};

/**
 * Safe Tokenized Mathematical Expression Evaluator (Zero eval() / Function())
 */
export function evaluateSafeMath(expr: string): number | null {
  try {
    let clean = expr.toLowerCase().replace(/\s+/g, '');

    // Handle "X% of Y": e.g. "15% of 850" -> "(15/100)*850"
    const pctMatch = expr.match(/([\d.]+)\s*%\s*of\s*([\d.]+)/i);
    if (pctMatch) {
      const p = parseFloat(pctMatch[1]);
      const total = parseFloat(pctMatch[2]);
      if (!isNaN(p) && !isNaN(total)) {
        return (p / 100) * total;
      }
    }

    // Replace constants
    clean = clean.replace(/\bpi\b/g, String(Math.PI)).replace(/\be\b/g, String(Math.E));

    // Support sqrt, cbrt, sin, cos, tan, abs, log, log10, exp
    clean = clean
      .replace(/sqrt\(([^()]+)\)/g, (_, val) => String(Math.sqrt(parseFloat(val))))
      .replace(/cbrt\(([^()]+)\)/g, (_, val) => String(Math.cbrt(parseFloat(val))))
      .replace(/abs\(([^()]+)\)/g, (_, val) => String(Math.abs(parseFloat(val))))
      .replace(/sin\(([^()]+)\)/g, (_, val) => String(Math.sin(parseFloat(val))))
      .replace(/cos\(([^()]+)\)/g, (_, val) => String(Math.cos(parseFloat(val))))
      .replace(/tan\(([^()]+)\)/g, (_, val) => String(Math.tan(parseFloat(val))))
      .replace(/log\(([^()]+)\)/g, (_, val) => String(Math.log10(parseFloat(val))))
      .replace(/ln\(([^()]+)\)/g, (_, val) => String(Math.log(parseFloat(val))))
      .replace(/exp\(([^()]+)\)/g, (_, val) => String(Math.exp(parseFloat(val))));

    // Validate remaining characters: only digits, decimal dots, operators, parentheses, and power (^)
    if (!/^[\d.+\-*/%^()]+$/.test(clean)) {
      return null;
    }

    // Replace power operator
    while (clean.includes('^')) {
      clean = clean.replace(/([\d.]+)\^([\d.]+)/, (_, base, exp) =>
        String(Math.pow(parseFloat(base), parseFloat(exp)))
      );
    }

    // Parse simple expressions via standard arithmetic precedence parser
    // Simple recursive parser without eval
    const tokenize = (s: string) => {
      const tokens: string[] = [];
      let num = '';
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (/[0-9.]/.test(c)) {
          num += c;
        } else {
          if (num) {
            tokens.push(num);
            num = '';
          }
          if (c === '-' && (tokens.length === 0 || ['+', '-', '*', '/', '('].includes(tokens[tokens.length - 1]))) {
            num = '-';
          } else {
            tokens.push(c);
          }
        }
      }
      if (num) tokens.push(num);
      return tokens;
    };

    const tokens = tokenize(clean);
    if (tokens.length === 0) return null;

    // Evaluate tokens using Shunting Yard algorithm
    const ops: Record<string, { prec: number; assoc: string }> = {
      '+': { prec: 1, assoc: 'L' },
      '-': { prec: 1, assoc: 'L' },
      '*': { prec: 2, assoc: 'L' },
      '/': { prec: 2, assoc: 'L' },
      '%': { prec: 2, assoc: 'L' },
    };

    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    for (const t of tokens) {
      if (!isNaN(parseFloat(t))) {
        outputQueue.push(t);
      } else if (ops[t]) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          ops[operatorStack[operatorStack.length - 1]] &&
          ops[operatorStack[operatorStack.length - 1]].prec >= ops[t].prec
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.push(t);
      } else if (t === '(') {
        operatorStack.push(t);
      } else if (t === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.pop();
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop()!);
    }

    const evalStack: number[] = [];
    for (const token of outputQueue) {
      if (!isNaN(parseFloat(token))) {
        evalStack.push(parseFloat(token));
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (a === undefined || b === undefined) return null;
        switch (token) {
          case '+': evalStack.push(a + b); break;
          case '-': evalStack.push(a - b); break;
          case '*': evalStack.push(a * b); break;
          case '/':
            if (b === 0) return null;
            evalStack.push(a / b);
            break;
          case '%': evalStack.push(a % b); break;
        }
      }
    }

    if (evalStack.length === 1 && !isNaN(evalStack[0])) {
      return Number(evalStack[0].toFixed(8));
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Unit Conversion Table (standardized to base SI units)
 */
interface UnitRatio {
  base: string;
  factor: number;
}
const UNIT_FACTORS: Record<string, UnitRatio> = {
  // Length (base meter)
  'm': { base: 'meter', factor: 1 },
  'meter': { base: 'meter', factor: 1 },
  'meters': { base: 'meter', factor: 1 },
  'km': { base: 'meter', factor: 1000 },
  'kilometer': { base: 'meter', factor: 1000 },
  'kilometers': { base: 'meter', factor: 1000 },
  'cm': { base: 'meter', factor: 0.01 },
  'centimeter': { base: 'meter', factor: 0.01 },
  'centimeters': { base: 'meter', factor: 0.01 },
  'mm': { base: 'meter', factor: 0.001 },
  'millimeter': { base: 'meter', factor: 0.001 },
  'mile': { base: 'meter', factor: 1609.344 },
  'miles': { base: 'meter', factor: 1609.344 },
  'mi': { base: 'meter', factor: 1609.344 },
  'yard': { base: 'meter', factor: 0.9144 },
  'yards': { base: 'meter', factor: 0.9144 },
  'yd': { base: 'meter', factor: 0.9144 },
  'foot': { base: 'meter', factor: 0.3048 },
  'feet': { base: 'meter', factor: 0.3048 },
  'ft': { base: 'meter', factor: 0.3048 },
  'inch': { base: 'meter', factor: 0.0254 },
  'inches': { base: 'meter', factor: 0.0254 },
  'in': { base: 'meter', factor: 0.0254 },

  // Mass (base kilogram)
  'kg': { base: 'kg', factor: 1 },
  'kilogram': { base: 'kg', factor: 1 },
  'kilograms': { base: 'kg', factor: 1 },
  'g': { base: 'kg', factor: 0.001 },
  'gram': { base: 'kg', factor: 0.001 },
  'grams': { base: 'kg', factor: 0.001 },
  'mg': { base: 'kg', factor: 0.000001 },
  'milligram': { base: 'kg', factor: 0.000001 },
  'lb': { base: 'kg', factor: 0.45359237 },
  'lbs': { base: 'kg', factor: 0.45359237 },
  'pound': { base: 'kg', factor: 0.45359237 },
  'pounds': { base: 'kg', factor: 0.45359237 },
  'oz': { base: 'kg', factor: 0.0283495231 },
  'ounce': { base: 'kg', factor: 0.0283495231 },
  'ounces': { base: 'kg', factor: 0.0283495231 },
  'ton': { base: 'kg', factor: 1000 },
  'tons': { base: 'kg', factor: 1000 },

  // Speed (base km/h)
  'km/h': { base: 'kmh', factor: 1 },
  'kmh': { base: 'kmh', factor: 1 },
  'kph': { base: 'kmh', factor: 1 },
  'mph': { base: 'kmh', factor: 1.60934 },
  'knot': { base: 'kmh', factor: 1.852 },
  'knots': { base: 'kmh', factor: 1.852 },
  'm/s': { base: 'kmh', factor: 3.6 },

  // Digital storage (base MB)
  'b': { base: 'mb', factor: 1 / (1024 * 1024) },
  'bytes': { base: 'mb', factor: 1 / (1024 * 1024) },
  'kb': { base: 'mb', factor: 1 / 1024 },
  'mb': { base: 'mb', factor: 1 },
  'gb': { base: 'mb', factor: 1024 },
  'tb': { base: 'mb', factor: 1024 * 1024 },
};

/**
 * Fetch latest currency exchange rates with fallback
 */
async function getCurrencyRates(): Promise<Record<string, number>> {
  if (currencyCache && Date.now() - currencyCache.timestamp < CURRENCY_CACHE_TTL) {
    return currencyCache.rates;
  }
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 2500 });
    if (res.data?.rates) {
      currencyCache = { rates: { ...FALLBACK_RATES, ...res.data.rates }, timestamp: Date.now() };
      return currencyCache.rates;
    }
  } catch {}
  return FALLBACK_RATES;
}

// Common Canonical Terms for instant offline/sandbox typo correction
const COMMON_CANONICAL_TERMS = [
  'albert einstein', 'elon musk', 'sundar pichai', 'steve jobs', 'bill gates', 'satya nadella',
  'python docs', 'python tutorial', 'javascript tutorial', 'typescript docs',
  'docker container', 'kubernetes cluster', 'react js', 'next js', 'tailwind css',
  'machine learning', 'artificial intelligence', 'quantum computing',
  'data structures and algorithms', 'github repository', 'stackoverflow'
];

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

export class InstantAnswerService {
  /**
   * Evaluates query to resolve high-intent instant answers (OneBoxes):
   * Calculator, Currency, Unit Conversion, World Clock, Dictionary, Age, Facts.
   */
  public async resolveInstantAnswer(
    query: string,
    intent?: QueryIntent
  ): Promise<ZenvoraDirectAnswer | null> {
    const cleanQ = query.trim();
    const lower = cleanQ.toLowerCase();

    // 1. Math & Calculation Expression
    // Detect math expressions like "25 * 40 / 3", "sqrt(144)", "15% of 850"
    const isMathPattern =
      /^[\d\s.+\-*/%^()]+$/.test(cleanQ) ||
      /\b(sqrt|cbrt|sin|cos|tan|log|ln|abs)\s*\([\d.]+\)/i.test(cleanQ) ||
      /\b\d+\s*%\s*of\s*\d+/i.test(cleanQ);

    if (isMathPattern && !/^[a-z]+$/i.test(cleanQ)) {
      const calcResult = evaluateSafeMath(cleanQ);
      if (calcResult !== null) {
        return {
          type: 'calculator',
          title: cleanQ,
          answer: Number.isInteger(calcResult) ? calcResult.toString() : calcResult.toLocaleString('en-US', { maximumFractionDigits: 6 }),
          subtext: 'Calculation result',
          icon: 'Calculator',
        };
      }
    }

    // 2. Currency Conversion (e.g. "100 USD to EUR", "5000 inr in usd", "1 btc to usd")
    const currencyMatch = lower.match(
      /^(\d+(?:\.\d+)?)\s*([a-z]{3})\s*(?:to|in|=)\s*([a-z]{3})$/i
    );
    if (currencyMatch) {
      const amount = parseFloat(currencyMatch[1]);
      const fromCurr = currencyMatch[2].toUpperCase();
      const toCurr = currencyMatch[3].toUpperCase();

      const rates = await getCurrencyRates();
      if (rates[fromCurr] && rates[toCurr]) {
        // Convert via USD base
        const inUsd = amount / rates[fromCurr];
        const converted = inUsd * rates[toCurr];
        const ratePerOne = (1 / rates[fromCurr]) * rates[toCurr];

        return {
          type: 'currency',
          title: `${amount.toLocaleString()} ${fromCurr} =`,
          answer: `${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurr}`,
          subtext: `1 ${fromCurr} = ${ratePerOne.toFixed(4)} ${toCurr}`,
          icon: 'Coins',
        };
      }
    }

    // 3. Unit Conversion (e.g. "10 km to miles", "50 lbs in kg", "100 c in f")
    // Temperature special handling:
    const tempMatch = lower.match(
      /^(\d+(?:\.\d+)?)\s*(c|celsius|f|fahrenheit|k|kelvin)\s*(?:to|in|=)\s*(c|celsius|f|fahrenheit|k|kelvin)$/i
    );
    if (tempMatch) {
      const val = parseFloat(tempMatch[1]);
      const fromT = tempMatch[2][0].toUpperCase();
      const toT = tempMatch[3][0].toUpperCase();

      let resVal = val;
      if (fromT === 'C' && toT === 'F') resVal = (val * 9) / 5 + 32;
      else if (fromT === 'F' && toT === 'C') resVal = ((val - 32) * 5) / 9;
      else if (fromT === 'C' && toT === 'K') resVal = val + 273.15;
      else if (fromT === 'K' && toT === 'C') resVal = val - 273.15;
      else if (fromT === 'F' && toT === 'K') resVal = ((val - 32) * 5) / 9 + 273.15;
      else if (fromT === 'K' && toT === 'F') resVal = ((val - 273.15) * 9) / 5 + 32;

      return {
        type: 'converter',
        title: `${val} °${fromT} =`,
        answer: `${resVal.toFixed(2)} °${toT}`,
        subtext: 'Temperature Conversion',
        icon: 'Thermometer',
      };
    }

    // Standard Units (Length, Mass, Speed, Storage)
    const unitMatch = lower.match(
      /^(\d+(?:\.\d+)?)\s*([a-z/]+)\s*(?:to|in|=)\s*([a-z/]+)$/i
    );
    if (unitMatch) {
      const val = parseFloat(unitMatch[1]);
      const fromU = unitMatch[2].toLowerCase();
      const toU = unitMatch[3].toLowerCase();

      const u1 = UNIT_FACTORS[fromU];
      const u2 = UNIT_FACTORS[toU];

      if (u1 && u2 && u1.base === u2.base) {
        const inBase = val * u1.factor;
        const converted = inBase / u2.factor;

        return {
          type: 'converter',
          title: `${val} ${fromU} =`,
          answer: `${converted.toLocaleString('en-US', { maximumFractionDigits: 5 })} ${toU}`,
          subtext: `1 ${fromU} = ${(u1.factor / u2.factor).toFixed(4)} ${toU}`,
          icon: 'Scale',
        };
      }
    }

    // 4. World Clock & Local Time (e.g. "time in tokyo", "what time is it in london")
    const clockMatch = lower.match(
      /(?:what\s+is\s+the\s+)?(?:current\s+)?time\s+(?:in|for|at)\s+([a-z\s]+)/i
    );
    if (clockMatch) {
      const locationKey = clockMatch[1].replace(/[?.,!&]+$/, '').trim();
      const tzData = CITY_TIMEZONES[locationKey];

      if (tzData) {
        try {
          const now = new Date();
          const timeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tzData.zone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tzData.zone,
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          const formattedTime = timeFormatter.format(now);
          const formattedDate = dateFormatter.format(now);

          return {
            type: 'clock',
            title: `Time in ${tzData.city}, ${tzData.country}`,
            answer: formattedTime,
            subtext: `${formattedDate} (${tzData.zone})`,
            icon: 'Clock',
          };
        } catch {}
      }
    }

    // 5. English Dictionary & Definition (e.g. "define serendipity", "meaning of resilient")
    const dictMatch = lower.match(
      /^(?:define|meaning\s+of|definition\s+of|what\s+is\s+the\s+meaning\s+of)\s+([a-z]+)$/i
    );
    if (dictMatch) {
      const word = dictMatch[1].trim();
      if (word.length >= 2) {
        try {
          const dictRes = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            { timeout: 2500 }
          );
          if (Array.isArray(dictRes.data) && dictRes.data.length > 0) {
            const entry = dictRes.data[0];
            const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
            const meaning = entry.meanings?.[0];
            const partOfSpeech = meaning?.partOfSpeech || 'definition';
            const defItem = meaning?.definitions?.[0];
            const definition = defItem?.definition || '';
            const example = defItem?.example;

            if (definition) {
              const capWord = word.charAt(0).toUpperCase() + word.slice(1);
              return {
                type: 'dictionary',
                title: capWord,
                answer: definition,
                subtext: phonetic ? `${partOfSpeech} • ${phonetic}` : partOfSpeech,
                details: {
                  example: example ? `"${example}"` : undefined,
                  partOfSpeech,
                  phonetic,
                },
                icon: 'BookOpen',
              };
            }
          }
        } catch {}
      }
    }

    // 6. Direct Country Capital Facts (e.g. "capital of France", "capital of Japan")
    const capitalMatch = lower.match(
      /^(?:what\s+is\s+the\s+)?capital\s+(?:of|city\s+of)\s+([a-z\s]+)/i
    );
    if (capitalMatch) {
      const countryKey = capitalMatch[1].replace(/[?.,!&]+$/, '').trim();
      const capitalCity = COUNTRY_CAPITALS[countryKey];
      if (capitalCity) {
        const countryName = countryKey
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return {
          type: 'fact',
          title: `Capital of ${countryName}`,
          answer: capitalCity,
          subtext: `Capital city of ${countryName}`,
          icon: 'MapPin',
        };
      }
    }

    // 7. Physical and Scientific Constants (e.g. "speed of light", "planck constant")
    for (const [key, fact] of Object.entries(CONSTANTS_FACTS)) {
      if (lower === key || lower === `what is the ${key}` || lower === `value of ${key}`) {
        const titleName = key.charAt(0).toUpperCase() + key.slice(1);
        return {
          type: 'fact',
          title: titleName,
          answer: fact.value,
          subtext: fact.desc,
          icon: 'Atom',
        };
      }
    }

    // 8. Dynamic Person Age Resolution (e.g. "how old is Elon Musk", "age of Albert Einstein")
    const ageMatch = lower.match(
      /^(?:how\s+old\s+is|what\s+is\s+the\s+age\s+of|age\s+of)\s+([a-z\s]+)/i
    ) || lower.match(/^([a-z\s]+)\s+age$/i);

    if (ageMatch) {
      const personName = ageMatch[1].replace(/[?.,!&]+$/, '').trim();
      if (personName.length >= 3) {
        try {
          const wikiRes = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(personName)}`,
            {
              headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
              timeout: 2500,
            }
          );
          if (wikiRes.data && wikiRes.data.extract) {
            const extract = wikiRes.data.extract;

            // Pattern 1: Living person "(born June 28, 1971)"
            const bornMatch = extract.match(/\(born\s+([A-Za-z]+ \d{1,2},\s*\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
            if (bornMatch) {
              const birthDateStr = bornMatch[1];
              const birthDate = new Date(birthDateStr);
              if (!isNaN(birthDate.getTime())) {
                const now = new Date();
                let age = now.getFullYear() - birthDate.getFullYear();
                const m = now.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
                  age--;
                }
                const capName = wikiRes.data.title || personName;
                return {
                  type: 'age',
                  title: `${capName}'s Age`,
                  answer: `${age} years old`,
                  subtext: `Born on ${birthDateStr}`,
                  icon: 'Calendar',
                };
              }
            }

            // Pattern 2: Historical figure lifespan "(1879–1955)"
            const lifeMatch = extract.match(/\((\d{4})[–—-](\d{4})\)/);
            if (lifeMatch) {
              const birthYear = parseInt(lifeMatch[1], 10);
              const deathYear = parseInt(lifeMatch[2], 10);
              const lifespan = deathYear - birthYear;
              const capName = wikiRes.data.title || personName;
              return {
                type: 'age',
                title: `${capName}'s Lifespan`,
                answer: `${lifespan} years old (${birthYear}–${deathYear})`,
                subtext: `Lived from ${birthYear} to ${deathYear}`,
                icon: 'Calendar',
              };
            }
          }
        } catch {}
      }
    }

    return null;
  }

  /**
   * Generates interactive "People Also Ask" discovery questions tailored to query intent.
   */
  public generateRelatedQuestions(query: string, intent?: QueryIntent): string[] {
    const cleanQ = (intent?.subject || query).trim();
    const isPerson = intent?.isPerson || intent?.primaryIntent === 'person';

    if (isPerson) {
      return [
        `What is ${cleanQ}'s net worth?`,
        `What companies did ${cleanQ} found?`,
        `Where was ${cleanQ} educated?`,
        `What are the most notable achievements of ${cleanQ}?`,
      ];
    }

    if (intent?.primaryIntent === 'it') {
      return [
        `How to get started with ${cleanQ}?`,
        `Best practices and tutorials for ${cleanQ}`,
        `What are common alternatives to ${cleanQ}?`,
        `Common errors and solutions in ${cleanQ}`,
      ];
    }

    if (intent?.primaryIntent === 'science') {
      return [
        `What are the core principles of ${cleanQ}?`,
        `Recent scientific research on ${cleanQ}`,
        `Who discovered or formulated ${cleanQ}?`,
      ];
    }

    return [
      `What is the history of ${cleanQ}?`,
      `How does ${cleanQ} work?`,
      `Key facts and overview of ${cleanQ}`,
      `Latest updates regarding ${cleanQ}`,
    ];
  }

  /**
   * Checks for obvious spelling errors and suggests canonical query.
   * Leverages multi-engine autocomplete signals and Levenshtein edit distance.
   */
  public async detectSpellingCorrection(query: string): Promise<string | null> {
    const cleanQ = query.trim().toLowerCase();
    if (cleanQ.length < 4 || cleanQ.includes('.') || cleanQ.includes('://')) return null;

    let candidateSuggestions: string[] = [];

    // 1. Check Google Autocomplete (world-class query spell telemetry)
    try {
      const googleRes = await axios.get('https://suggestqueries.google.com/complete/search', {
        params: { client: 'firefox', q: cleanQ },
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 1800,
      });
      if (Array.isArray(googleRes.data?.[1])) {
        candidateSuggestions.push(...googleRes.data[1].map((s: any) => String(s).trim().toLowerCase()));
      }
    } catch {}

    // 2. Check DuckDuckGo Autocomplete
    if (candidateSuggestions.length === 0) {
      try {
        const ddgRes = await axios.get('https://duckduckgo.com/ac/', {
          params: { q: cleanQ, type: 'list' },
          timeout: 1500,
          headers: { 'User-Agent': 'ZenvoraSearch/1.0' },
        });
        if (Array.isArray(ddgRes.data?.[1])) {
          candidateSuggestions.push(...ddgRes.data[1].map((s: any) => (typeof s === 'string' ? s : s?.phrase || '').trim().toLowerCase()));
        }
      } catch {}
    }

    // 3. Fallback to local canonical dictionary for fast offline/sandbox typo detection
    if (candidateSuggestions.length === 0) {
      candidateSuggestions.push(...COMMON_CANONICAL_TERMS);
    }

    for (const sug of candidateSuggestions) {
      if (!sug || sug === cleanQ || sug.startsWith(cleanQ) || cleanQ.startsWith(sug)) continue;
      const dist = levenshteinDistance(cleanQ, sug);
      const maxLen = Math.max(cleanQ.length, sug.length);

      // Typos are usually 1 to 3 character edits
      const isTypo = (dist <= 2 && maxLen >= 5) || (dist <= 3 && maxLen >= 10);
      if (isTypo) {
        // Format to Title Case if original words were separated
        return sug
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }

    return null;
  }
}

export const instantAnswerService = new InstantAnswerService();

