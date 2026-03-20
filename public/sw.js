// AGRIPOINT Service Worker v1 — Vanilla (cache-first static, network-first HTML, network-only API)
const CACHE_VERSION = 'agripoint-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const PAGE_CACHE    = `${CACHE_VERSION}-pages`;

const PRECACHE_PAGES = [
  '/',
  '/produits',
  '/nos-distributeurs',
  '/blog',
  '/offline',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGE_CACHE).then(cache =>
      cache.addAll(PRECACHE_PAGES).catch(() => { /* silently ignore network errors during install */ })
    )
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('agripoint-') && k !== STATIC_CACHE && k !== PAGE_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) {
    // For tile CDN requests (maps), use cache-first
    if (url.hostname.includes('cartocdn') || url.hostname.includes('openstreetmap')) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    return;
  }

  // API routes — network only (never cache)
  if (url.pathname.startsWith('/api/')) return;

  // Static assets (_next/static) — cache first, immutable
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|gif|ico|woff2?|css|js)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation — network first, fallback /offline
  event.respondWith(networkFirstWithOfflineFallback(request));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Network error', { status: 408 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const offlinePage = await cache.match('/offline');
    return offlinePage ?? new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}
