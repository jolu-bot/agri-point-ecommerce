import { NextRequest } from 'next/server';
import { cache } from '@/lib/cache';

type JsonValue = Record<string, any>;

export function buildCacheKey(namespace: string, request: NextRequest): string {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  return `${namespace}:${query || 'default'}`;
}

export function getCachedPayload<T extends JsonValue>(key: string): T | null {
  return cache.get<T>(key);
}

export function setCachedPayload<T extends JsonValue>(key: string, payload: T, ttlMs: number): void {
  cache.set(key, payload, ttlMs);
}

export function invalidateCacheByPattern(pattern: string): void {
  cache.invalidateByPattern(pattern);
}

export function publicCacheHeaders(maxAgeSeconds: number, staleWhileRevalidateSeconds = 300): HeadersInit {
  return {
    'Cache-Control': `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  };
}

export function privateCacheHeaders(maxAgeSeconds: number, staleWhileRevalidateSeconds = 60): HeadersInit {
  return {
    'Cache-Control': `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  };
}

export function noStoreHeaders(): HeadersInit {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}
