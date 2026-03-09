/**
 * AGRIPOINT SERVICES — Security Arsenal
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized security utilities:
 *   • Sliding-window in-memory rate limiter
 *   • Input sanitization (XSS, HTML injection)
 *   • Threat detection (SQL injection, XSS, path traversal, SSRF)
 *   • MongoDB ObjectId validation
 *   • IP extraction (behind reverse proxy / Vercel / Cloudflare)
 *   • CSRF token generation & validation
 *   • Secure random token generation
 *   • Response hardening helpers
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// ── 1. IP EXTRACTION ──────────────────────────────────────────────────────────

/**
 * Extracts the real client IP respecting Vercel / Cloudflare / Nginx headers.
 * Falls back to '127.0.0.1' — NEVER returns undefined.
 */
export function getClientIp(req: NextRequest): string {
  const headers = [
    'cf-connecting-ip',          // Cloudflare
    'x-real-ip',                 // Nginx
    'x-forwarded-for',           // Standard proxy
    'x-vercel-forwarded-for',    // Vercel edge
    'fastly-client-ip',          // Fastly CDN
    'x-cluster-client-ip',       // GKE
    'x-client-ip',               // Apache
    'true-client-ip',            // Akamai
  ];

  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list; take the first (client)
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) return ip;
    }
  }
  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  // IPv4
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 simplified check
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

// ── 2. SLIDING-WINDOW RATE LIMITER ────────────────────────────────────────────
// Pure in-memory — for single-instance. For multi-instance use Upstash Redis.

interface RateLimitBucket {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Auto-cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitStore.entries()) {
      if (bucket.blockedUntil && now > bucket.blockedUntil) {
        rateLimitStore.delete(key);
      } else if (!bucket.blocked && bucket.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Number of requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** How long to block after exceeding (ms). Defaults to windowMs */
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Sliding-window rate limiter keyed by IP + endpoint.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const { limit, windowMs, blockDurationMs = windowMs } = options;

  // Get or create bucket
  let bucket = rateLimitStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [], blocked: false };
    rateLimitStore.set(key, bucket);
  }

  // Check if still blocked
  if (bucket.blocked && bucket.blockedUntil) {
    if (now < bucket.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.blockedUntil,
        retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000),
      };
    }
    // Block expired
    bucket.blocked = false;
    bucket.blockedUntil = undefined;
    bucket.timestamps = [];
  }

  // Slide window: remove timestamps outside the window
  bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);

  if (bucket.timestamps.length >= limit) {
    bucket.blocked = true;
    bucket.blockedUntil = now + blockDurationMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.blockedUntil,
      retryAfter: Math.ceil(blockDurationMs / 1000),
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - bucket.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Returns a NextResponse with rate-limit headers and 429 status.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Trop de requêtes. Veuillez patienter.',
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter ?? 60),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
      },
    }
  );
}

// ── 3. INPUT SANITIZATION ─────────────────────────────────────────────────────

/** Strips HTML tags and encodes dangerous characters to prevent XSS. */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Encode &, <, >, ", ' in a safe way
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove CRLF injection
    .replace(/[\r\n]/g, ' ');
}

/** Sanitizes an entire object's string values recursively (depth-limited). */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  depth = 0
): T {
  if (depth > 5) return obj; // Guard against deeply nested payloads
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>, depth + 1);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, depth + 1)
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// ── 4. THREAT DETECTION ───────────────────────────────────────────────────────

const SQL_INJECTION_PATTERNS = [
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
  /('|")\s*(OR|AND)\s*('|")\s*=\s*('|")/i,
  /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|TRUNCATE)\s+/i,
  /UNION\s+(ALL\s+)?SELECT/i,
  /--\s*$/,
  /\/\*.*\*\//,
  /xp_cmdshell/i,
  /EXEC\s*\(/i,
  /CAST\s*\(\s*\w+\s+AS\s+/i,
];

const XSS_PATTERNS = [
  /<script[\s\S]*?>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["']?[^"']*["']?/i,
  /<iframe[\s\S]*?>/i,
  /data\s*:\s*text\s*\/\s*(html|javascript)/i,
  /vbscript\s*:/i,
  /<object[\s\S]*?>/i,
  /<embed[\s\S]*?>/i,
  /expression\s*\(/i,
  /url\s*\(\s*javascript/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /%2e%2e[%2f%5c]/i,
  /\.\.%2f/i,
  /%252e%252e/i,
];

const SSRF_PATTERNS = [
  /localhost/i,
  /127\.0\.0\./,
  /0\.0\.0\.0/,
  /169\.254\./,        // AWS metadata
  /metadata\.google/i,
  /192\.168\./,
  /10\.\d+\.\d+\.\d+/,
];

export type ThreatType = 'sql_injection' | 'xss' | 'path_traversal' | 'ssrf' | 'none';

export interface ThreatScanResult {
  safe: boolean;
  threat: ThreatType;
  matchedField?: string;
}

/**
 * Scans a string or object for known attack patterns.
 * Returns immediately on first threat found.
 */
export function scanForThreats(
  input: string | Record<string, unknown>,
  checkSsrf = false
): ThreatScanResult {
  const values: Array<[string, string]> =
    typeof input === 'string'
      ? [['value', input]]
      : Object.entries(input)
          .filter(([, v]) => typeof v === 'string')
          .map(([k, v]) => [k, v as string]);

  for (const [field, value] of values) {
    const str = String(value);

    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(str)) return { safe: false, threat: 'sql_injection', matchedField: field };
    }
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(str)) return { safe: false, threat: 'xss', matchedField: field };
    }
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(str)) return { safe: false, threat: 'path_traversal', matchedField: field };
    }
    if (checkSsrf) {
      for (const pattern of SSRF_PATTERNS) {
        if (pattern.test(str)) return { safe: false, threat: 'ssrf', matchedField: field };
      }
    }
  }

  return { safe: true, threat: 'none' };
}

// ── 5. MONGODB OBJECTID VALIDATION ───────────────────────────────────────────

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

export function isValidMongoId(id: unknown): id is string {
  return typeof id === 'string' && MONGO_ID_REGEX.test(id);
}

export function assertValidMongoId(id: unknown, field = 'id'): string {
  if (!isValidMongoId(id)) {
    throw new SecurityError(`Invalid ${field} format`, 400);
  }
  return id;
}

// ── 6. SECURE TOKEN GENERATION ────────────────────────────────────────────────

/** Generates a cryptographically secure URL-safe token. */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** SHA-256 hash of a token for safe DB storage. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── 7. CSRF PROTECTION ────────────────────────────────────────────────────────

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Generates a CSRF token tied to a session identifier (e.g., userId).
 * Token = base64url(hmac(sessionId + timestamp))
 */
export function generateCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${sessionId}:${timestamp}`;
  const hmac = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

/**
 * Validates a CSRF token.
 * @param token - The token from the request header/body
 * @param sessionId - The expected session identifier
 * @param maxAgeMs - Maximum token age in ms (default 1h)
 */
export function validateCsrfToken(
  token: string,
  sessionId: string,
  maxAgeMs = 60 * 60 * 1000
): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const [sid, timestampB36] = payload.split(':');
    if (sid !== sessionId) return false;

    const timestamp = parseInt(timestampB36, 36);
    if (Date.now() - timestamp > maxAgeMs) return false;

    const expectedHmac = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('base64url');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedHmac)
    );
  } catch {
    return false;
  }
}

// ── 8. SECURITY ERROR ─────────────────────────────────────────────────────────

export class SecurityError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'SecurityError';
    this.statusCode = statusCode;
  }
}

export function securityErrorResponse(err: SecurityError): NextResponse {
  return NextResponse.json({ error: err.message }, { status: err.statusCode });
}

// ── 9. BOT / SCRAPER DETECTION ────────────────────────────────────────────────

const KNOWN_SCRAPERS = [
  'scrapy', 'wget', 'curl', 'python-requests', 'python-urllib',
  'go-http-client', 'java/', 'perl', 'ruby', 'libwww',
  'mechanize', 'phantom', 'spiderbot', 'crawler4j',
  'baiduspider', 'yandexbot', 'semrushbot', 'dotbot', 'mj12bot',
  'ahrefsbot', 'dataforseobot', 'serpstatbot', 'bytespider',
  'claudebot', 'gpt',  // AI training scrapers
  'ccbot',
];

const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
];

export function classifyUserAgent(ua: string | null): 'human' | 'allowed_bot' | 'scraper' | 'suspicious' {
  if (!ua || ua.length < 10) return 'suspicious';
  const lower = ua.toLowerCase();

  if (ALLOWED_BOTS.some(bot => lower.includes(bot))) return 'allowed_bot';
  if (KNOWN_SCRAPERS.some(scraper => lower.includes(scraper))) return 'scraper';

  // Suspicious: no common browser token
  const hasBrowserToken = lower.includes('mozilla') || lower.includes('chrome') || lower.includes('safari') || lower.includes('firefox');
  if (!hasBrowserToken) return 'suspicious';

  return 'human';
}

// ── 10. EMAIL VALIDATION ──────────────────────────────────────────────────────

/** RFC 5322 simplified — rejects obvious garbage. */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  // Extra: reject disposable domain patterns & dangerously long local parts
  const [local] = email.split('@');
  if (local.length > 64) return false;
  return regex.test(email);
}

/** Validates Cameroon phone (starts with 6, 7 digits after, or 9 digits total) */
export function isValidCameroonPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Accept: 6XXXXXXXX (9 digits), or 237XXXXXXXXX
  return /^(237)?[6-9]\d{8}$/.test(cleaned);
}

// ── 11. PASSWORD STRENGTH ─────────────────────────────────────────────────────

export interface PasswordStrengthResult {
  strong: boolean;
  score: number; // 0-4
  issues: string[];
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const issues: string[] = [];
  let score = 0;

  if (password.length >= 8) score++; else issues.push('Minimum 8 caractères');
  if (/[A-Z]/.test(password)) score++; else issues.push('Au moins 1 majuscule');
  if (/[0-9]/.test(password)) score++; else issues.push('Au moins 1 chiffre');
  if (/[^A-Za-z0-9]/.test(password)) score++; else issues.push('Au moins 1 caractère spécial');

  // Extra weakness checks
  if (/^(.)\1+$/.test(password)) {
    issues.push('Mot de passe trop répétitif');
    score = Math.max(0, score - 2);
  }

  const COMMON = ['password', 'motdepasse', '123456', 'qwerty', 'azerty', 'agripoint'];
  if (COMMON.some(c => password.toLowerCase().includes(c))) {
    issues.push('Mot de passe trop commun');
    score = Math.max(0, score - 1);
  }

  return { strong: score >= 3 && issues.length === 0, score, issues };
}

// ── 12. RESPONSE SECURITY HEADERS ────────────────────────────────────────────

/**
 * Applies a hardened set of security headers to any NextResponse.
 * Call this before returning API responses.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of sensitive API responses
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Prevent content-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer policy — don't leak paths to external
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Remove server fingerprinting headers (handled by Next.js poweredByHeader:false)
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

// ── 13. AUDIT LOG HELPER ─────────────────────────────────────────────────────

export interface SecurityEvent {
  type:
    | 'login_success' | 'login_failed' | 'login_blocked'
    | 'register' | 'password_reset'
    | 'token_refresh' | 'token_invalid'
    | 'rate_limit_hit' | 'threat_detected'
    | 'admin_action' | 'unauthorized_access';
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  detail?: string;
  timestamp?: Date;
}

/**
 * Logs security events without throwing.
 * In production you'd write to a dedicated SecurityLog collection or SIEM.
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const entry = {
    ...event,
    timestamp: event.timestamp ?? new Date(),
    env: process.env.NODE_ENV,
  };
  // Always log to console (structured for log aggregators like Vercel/Datadog)
  if (event.type.includes('failed') || event.type.includes('blocked') || event.type === 'threat_detected' || event.type === 'unauthorized_access') {
    console.warn('[SECURITY]', JSON.stringify(entry));
  } else {
    console.info('[SECURITY]', JSON.stringify(entry));
  }
  // TODO: persist to DB SecurityLog model in non-edge contexts
}
