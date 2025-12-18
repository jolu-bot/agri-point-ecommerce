// Debounce pour optimiser les recherches
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle pour limiter la fréquence d'exécution
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoize pour cacher les résultats de fonctions
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Format prix avec cache
export const formatPrice = memoize((price: number, currency: string = 'FCFA'): string => {
  return `${price.toLocaleString('fr-FR')} ${currency}`;
});

// Format date avec cache
export const formatDate = memoize((date: string | Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
});

// Batching des requêtes
export class RequestBatcher {
  private queue: Array<{
    url: string;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly delay: number;

  constructor(delay: number = 50) {
    this.delay = delay;
  }

  add<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });

      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => this.flush(), this.delay);
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // Grouper les requêtes par endpoint
      const groups = new Map<string, typeof batch>();
      batch.forEach(item => {
        const baseUrl = item.url.split('?')[0];
        if (!groups.has(baseUrl)) {
          groups.set(baseUrl, []);
        }
        groups.get(baseUrl)!.push(item);
      });

      // Exécuter les requêtes groupées
      for (const [baseUrl, items] of Array.from(groups.entries())) {
        const ids = items.map(item => {
          const params = new URLSearchParams(item.url.split('?')[1]);
          return params.get('id');
        }).filter(Boolean);

        try {
          const response = await fetch(`${baseUrl}/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          });

          const results = await response.json();

          items.forEach((item, index) => {
            item.resolve(results[index]);
          });
        } catch (error) {
          items.forEach(item => item.reject(error));
        }
      }
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

// Instance globale
export const requestBatcher = new RequestBatcher();

// Lazy loading des images
export function lazyLoadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Intersection Observer pour lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}
