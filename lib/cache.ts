// Cache utility pour optimiser les requêtes API
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresIn: number;
};

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });

    // Cleanup ancien cache
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const isExpired = (now - entry.timestamp) > entry.expiresIn;
      if (isExpired) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
  }

  // Invalider le cache par pattern
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const toDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instance singleton
export const cache = new CacheManager();

// Helper pour fetch avec cache
export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  ttl?: number
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Vérifier le cache
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch et mettre en cache
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Hook React pour cache
export function useCache<T>(key: string) {
  return {
    get: () => cache.get<T>(key),
    set: (data: T, ttl?: number) => cache.set(key, data, ttl),
    has: () => cache.has(key),
    delete: () => cache.delete(key),
  };
}
