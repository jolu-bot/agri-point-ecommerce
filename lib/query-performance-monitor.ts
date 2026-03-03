import { getLogger } from './logger-rotation';

export interface QueryMetrics {
  query: string;
  collection: string;
  operation: 'find' | 'insert' | 'update' | 'delete' | 'aggregate';
  duration: number; // ms
  timestamp: Date;
  isSlowQuery: boolean;
  indices: string[];
  documentCount?: number;
}

const SLOW_QUERY_THRESHOLD = 1000; // 1 second

/**
 * Monitore les performances des queries MongoDB
 */
export class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly maxMetrics = 10000; // Limite en mémoire

  /**
   * Enregistre une query et sa performance
   */
  recordQuery(metrics: Omit<QueryMetrics, 'isSlowQuery' | 'timestamp'>): void {
    const fullMetrics: QueryMetrics = {
      ...metrics,
      timestamp: new Date(),
      isSlowQuery: metrics.duration > SLOW_QUERY_THRESHOLD,
    };

    this.metrics.push(fullMetrics);

    // Limiter l'utilisation mémoire
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Logger les slow queries
    if (fullMetrics.isSlowQuery) {
      getLogger().warn(
        {
          query: fullMetrics.query,
          collection: fullMetrics.collection,
          duration: fullMetrics.duration,
          indices: fullMetrics.indices,
        },
        '🐌 SLOW QUERY DETECTED'
      );
    }
  }

  /**
   * Récupère les stats des performances
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueryCount: 0,
        slowQueryPercentage: 0,
        byOperation: {},
        byCollection: {},
      };
    }

    const slowQueries = this.metrics.filter(m => m.isSlowQuery);
    const avgDuration =
      this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length;

    // Stats par opération
    const byOperation: Record<string, { count: number; avgDuration: number }> = {};
    for (const op of ['find', 'insert', 'update', 'delete', 'aggregate'] as const) {
      const ops = this.metrics.filter(m => m.operation === op);
      if (ops.length > 0) {
        byOperation[op] = {
          count: ops.length,
          avgDuration: ops.reduce((sum, m) => sum + m.duration, 0) / ops.length,
        };
      }
    }

    // Stats par collection
    const byCollection: Record<string, { count: number; avgDuration: number }> = {};
    const collections = new Set(this.metrics.map(m => m.collection));
    for (const collection of collections) {
      const collMetrics = this.metrics.filter(m => m.collection === collection);
      byCollection[collection] = {
        count: collMetrics.length,
        avgDuration:
          collMetrics.reduce((sum, m) => sum + m.duration, 0) / collMetrics.length,
      };
    }

    return {
      totalQueries: this.metrics.length,
      averageDuration: Math.round(avgDuration),
      slowQueryCount: slowQueries.length,
      slowQueryPercentage: Math.round((slowQueries.length / this.metrics.length) * 100),
      byOperation,
      byCollection,
    };
  }

  /**
   * Récupère les slow queries
   */
  getSlowQueries(limit: number = 10): QueryMetrics[] {
    return this.metrics
      .filter(m => m.isSlowQuery)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Récupère les queries par collection
   */
  getQueriesByCollection(collection: string, limit: number = 50): QueryMetrics[] {
    return this.metrics
      .filter(m => m.collection === collection)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Réinitialise les métriques
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Exporte les métriques au format JSON
   */
  export(): QueryMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Singleton instance
 */
let monitorInstance: QueryPerformanceMonitor | null = null;

export function getQueryMonitor(): QueryPerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new QueryPerformanceMonitor();
  }
  return monitorInstance;
}

/**
 * Décorateur pour monitoring automatique des queries
 */
export function monitorQuery(operation: 'find' | 'insert' | 'update' | 'delete' | 'aggregate') {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const collection = target.constructor.name;

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        getQueryMonitor().recordQuery({
          query: propertyKey.toString(),
          collection,
          operation,
          duration,
          indices: [],
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        getQueryMonitor().recordQuery({
          query: propertyKey.toString(),
          collection,
          operation,
          duration,
          indices: [],
        });
        throw error;
      }
    };

    return descriptor;
  };
}
