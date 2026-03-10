/**
 * PREMIUM Structured Logger (Pino)
 * Production-grade logging avec contexte request, perf tracking, & Sentry integration
 */

import pino from 'pino';
import { type NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

// -- LOGGER CONFIG ------------------------------------------------------------

const pinoConfig = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{levelLabel} {msg}',
        },
      }
    : undefined,
};

export const logger = pino(pinoConfig);

// -- REQUEST LOGGER -----------------------------------------------------------

export interface RequestLogContext {
  requestId: string;
  method: string;
  pathname: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  userRole?: string;
  error?: Error | string;
  query?: Record<string, any>;
  ip?: string;
}

/**
 * Générer un contexte de log pour une requête
 */
export function createRequestContext(req: NextRequest, userId?: string, userRole?: string): Omit<RequestLogContext, 'statusCode' | 'duration' | 'error'> {
  const requestId = (Math.random() * 1e9).toString(36);
  const url = new URL(req.url);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';

  return {
    requestId,
    method: req.method,
    pathname: url.pathname,
    userId: userId || undefined,
    userRole: userRole || undefined,
    ip,
    query: Object.fromEntries(url.searchParams),
  };
}

/**
 * Logger les requêtes API
 */
export function logRequest(context: RequestLogContext) {
  const { statusCode, duration, error, ...rest } = context;

  const logLevel = error ? 'error' : statusCode && statusCode >= 500 ? 'error' : statusCode && statusCode >= 400 ? 'warn' : 'info';

  const logFn = logger[logLevel as keyof typeof logger] as (msg: string, obj?: any) => void;

  logFn(
    `${context.method} ${context.pathname} ${statusCode || '?'} ${duration ? `${duration}ms` : '?'}`,
    {
      ...rest,
      statusCode,
      duration,
      ...(error && { error: error instanceof Error ? error.message : error }),
    }
  );
}

// -- ERROR LOGGING ------------------------------------------------------------

/**
 * Logger une erreur avec stack trace
 */
export function logError(
  error: Error | string,
  context: {
    requestId?: string;
    userId?: string;
    endpoint?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  } = {}
) {
  const message = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(
    {
      ...context,
      severity: context.severity || 'medium',
      error: message,
      stack,
      timestamp: new Date().toISOString(),
    },
    `Error in ${context.endpoint || 'unknown'}: ${message}`
  );
}

// -- PERFORMANCE LOGGING ------------------------------------------------------

/**
 * Logger les métriques de performance
 */
export function logPerformance(
  operation: string,
  duration: number,
  context: {
    userId?: string;
    quantity?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  const isSlowThreshold = duration > 1000; // 1s
  const logLevel = isSlowThreshold ? 'warn' : 'debug';

  const logFn = logger[logLevel as keyof typeof logger] as (msg: string, obj?: any) => void;

  logFn(
    `${operation} completed in ${duration}ms${isSlowThreshold ? ' (SLOW)' : ''}`,
    {
      operation,
      duration,
      isSlow: isSlowThreshold,
      ...context,
      timestamp: new Date().toISOString(),
    }
  );
}

// -- BUSINESS EVENT LOGGING ---------------------------------------------------

/**
 * Logger les événements métier critiques
 */
export function logBusinessEvent(
  event: 'order_created' | 'order_completed' | 'payment_received' | 'user_registered' | 'product_published' | 'stock_alert' | 'admin_action',
  data: Record<string, any>
) {
  logger.info(
    {
      event,
      ...data,
      timestamp: new Date().toISOString(),
    },
    `Business Event: ${event}`
  );
}

// -- DATABASE LOGGING ---------------------------------------------------------

/**
 * Logger les opérations DB (optimisé pour production)
 */
export function logDatabaseOperation(
  operation: 'find' | 'create' | 'update' | 'delete' | 'aggregate',
  model: string,
  duration: number,
  success: boolean,
  error?: string
) {
  if (isDev || !success || duration > 500) {
    // Only verbose log en dev ou si slow/erreur
    const logLevel = !success ? 'error' : duration > 500 ? 'warn' : 'debug';
    const logFn = logger[logLevel as keyof typeof logger] as (msg: string, obj?: any) => void;

    logFn(
      `DB ${operation.toUpperCase()} ${model} in ${duration}ms`,
      {
        operation,
        model,
        duration,
        success,
        ...(error && { error }),
      }
    );
  }
}

// -- CACHE LOGGING ------------------------------------------------------------

/**
 * Logger cache hits/misses
 */
export function logCacheOperation(
  operation: 'hit' | 'miss' | 'set' | 'invalidate',
  key: string,
  ttl?: number
) {
  if (isDev) {
    logger.debug(
      {
        operation,
        key,
        ttl,
      },
      `Cache ${operation}: ${key}`
    );
  }
}

export default logger;
