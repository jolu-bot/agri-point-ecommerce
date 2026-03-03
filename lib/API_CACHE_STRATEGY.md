# 🚀 API Cache Strategy - Documentation

## 📋 Vue d'ensemble

Implémentation d'une stratégie de cache robuste et production-ready pour les APIs critiques (produits, commandes, analytics, stocks, locations).

### 🎯 Objectifs

- **Réduire la latence** : Cache local + headers HTTP
- **Diminuer la charge DB** : Invalidation intelligente sur mutations
- **Améliorer UX** : Stale-while-revalidate pour les données non-critiques
- **Résilience** : Fallback cache en cas de timeout réseau

## 🏗️ Architecture

### Couches de cache

```
┌──────────────────────────────────────────┐
│  Client Browser (HTTP Cache)             │ 120-600s (public/private)
├──────────────────────────────────────────┤
│  In-Memory Cache (lib/cache.ts)          │ 20-300s (runtime)
├──────────────────────────────────────────┤
│  Database (MongoDB)                      │ Source de vérité
└──────────────────────────────────────────┘
```

## 📡 Routes optimisées

### Public APIs (Lecture seule)

**`GET /api/products`**
- Cache: **120s** in-memory + **120s** s-maxage (browser)
- Stale: **300s** stale-while-revalidate
- Invalidation: POST/PUT/DELETE `/api/admin/products/*`

**`GET /api/public/locations`**
- Cache: **300s** in-memory + **300s** s-maxage
- Stale: **600s** stale-while-revalidate
- Invalidation: PUT `/api/admin/locations/*`

### Admin APIs (Authentifiées, en mutation fréquente)

**`GET /api/admin/products`**
- Cache: **45s** in-memory + **45s** max-age (private)
- Stale: **120s** stale-while-revalidate
- Invalidation: Immédiate sur POST/PUT/DELETE `/api/admin/products/*`

**`GET /api/admin/orders`**
- Cache: **20s** in-memory + **20s** max-age (private)
- Stale: **60s** stale-while-revalidate
- Invalidation: **Aucune** (données très volatiles)

**`GET /api/admin/analytics`**
- Cache: **30s** in-memory + **30s** max-age (private)
- Stale: **90s** stale-while-revalidate
- Invalidation: Immédiate sur mutations produits/commandes

**`GET /api/admin/products/low-stock`**
- Cache: **30s** in-memory + **30s** max-age (private)
- Stale: **90s** stale-while-revalidate
- Invalidation: Immédiate sur PATCH stock

## 🔄 Invalidation Patterns

### Product Mutations

```
POST    /api/admin/products
  └─> Invalide: api:admin:products:list, api:products:list, api:admin:analytics

PUT     /api/admin/products/[id]
  └─> Invalide: api:admin:products:list, api:products:list, api:admin:analytics

DELETE  /api/admin/products/[id]
  └─> Invalide: api:admin:products:list, api:products:list, api:admin:analytics

PATCH   /api/admin/products/[id]/stock
  └─> Invalide: api:admin:products:list, api:admin:products:low-stock,
                 api:products:list, api:admin:analytics
```

## 📊 Gains attendus

### Sans cache
- Requête type: **50-150ms** (DB query)
- Cache hit ratio: **0%**
- Coût DB: **100% des appels**

### Avec cache
- Requête cache hit: **<1ms** (in-memory)
- Requête cache miss: **50-150ms** (DB)
- Cache hit ratio: ~**70-85%** (dépend du pattern d'utilisation)
- Coût DB: **15-30% des appels**

### Métriques Performance

```
Product list (avec 1000 requêtes/min):
  • Sans cache  : 100% * 100ms = 100.000ms/min (100ms moyen)
  • Avec cache  : 80% * 0.1ms + 20% * 100ms = 20.08ms moyen (-80%)

Analytics dashboard (requête 10x/min):
  • Sans cache  : 10 * 200ms = 2000ms (200ms moyen)
  • Avec cache  : 9 * 0.5ms + 1 * 200ms = 200.5ms moyen (-99.7%)
```

## 🔌 Utilisation

### Décorer une route GET

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  buildCacheKey,
  getCachedPayload,
  setCachedPayload,
  publicCacheHeaders,
} from '@/lib/api-route-cache';

export async function GET(req: NextRequest) {
  try {
    // 1. Génère une clé cache unique según query params
    const cacheKey = buildCacheKey('api:ma-resource', req);
    
    // 2. Vérifie si données en cache
    const cached = getCachedPayload<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: publicCacheHeaders(60, 300), // 60s cache + 300s stale-while-revalidate
      });
    }

    // 3. Requête DB
    const data = await fetchData();
    
    // 4. Stock en cache
    setCachedPayload(cacheKey, data, 60_000); // 60 secondes

    return NextResponse.json(data, {
      headers: publicCacheHeaders(60, 300),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### Invalider sur mutation

```typescript
import { invalidateCacheByPattern } from '@/lib/api-route-cache';

export async function POST(req: NextRequest) {
  try {
    // Crée la ressource
    const newItem = await Item.create(await req.json());
    
    // Invalide les caches liés
    invalidateCacheByPattern('^api:items:list');
    invalidateCacheByPattern('^api:admin:analytics');
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
```

## 🛠️ Configuration Avancée

### Ajuster TTL par scenario

```typescript
// Données très stables (locations, categories)
publicCacheHeaders(600, 1800)  // 10min + 30min stale

// Données medium (products)
publicCacheHeaders(120, 300)   // 2min + 5min stale

// Données volatiles (orders status)
publicCacheHeaders(20, 60)     // 20s + 1min stale
```

### Pattern matching regex

```typescript
// Invalide exact
invalidateCacheByPattern('^api:admin:products:list$');

// Invalide wildcard
invalidateCacheByPattern('^api:admin:products:');  // Tous les produits admin

// Invalide tout admin
invalidateCacheByPattern('^api:admin:');
```

## 📈 Monitoring

### Vérifier l'état du cache

```typescript
import { cache } from '@/lib/cache';

// Route diagnostic réservée admin
export async function GET(req: NextRequest) {
  const stats = cache.getStats();
  
  return NextResponse.json({
    cacheSize: stats.size,
    maxSize: 100,
    hitRate: calculateHitRate(), // À implémenter
    keys: stats.keys,
  });
}
```

## ⚠️ Limitations & Considérations

### In-memory uniquement
- Cache perdu au redémarrage du serveur
- **Solution production** : Ajouter Redis/Upstash pour cache distribué

### Single-replica cache
- Pas de synchronisation entre instances (si horizontal scaling)
- **Accepté** en phase I, évaluer Redis pour phase II

### Invalidation pattern-based
- Peut causer invalidation excessive si pattern trop large
- **Bonnes pratiques** : Spécifier patterns le plus précis possible

## 🚀 Roadmap Phase III+

1. **Redis Integration** (si scaling demand)
   ```
   npm install redis ioredis
   Wrapper RedisCache au-dessus de CacheManager
   ```

2. **Distributed Invalidation**
   ```
   Event-driven: Publish cache:invalidate via Redis Pub/Sub
   ```

3. **Metrics & Dashboards**
   ```
   Prometheus pour cache hit/miss ratios
   Grafana dashboard pour visualisation
   ```

4. **Smart TTL** (ML-based)
   ```
   Ajust TTL selon hit rate historique
   ```

---

**✨ Déploié le 3 mars 2026 - AGRI POINT Premium Cache Strategy**
