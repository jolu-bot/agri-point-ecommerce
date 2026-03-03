import pino from 'pino';
import pinoPretty from 'pino-pretty';

/**
 * Logger avec rotation automatique
 * Utilise pino avec file rotation via transport
 */
export function createLogger(options?: {
  level?: string;
  folder?: string;
}) {
  const isDev = process.env.NODE_ENV === 'development';
  const logLevel = options?.level || process.env.LOG_LEVEL || 'info';
  const logFolder = options?.folder || './logs';

  const transport = pino.transport({
    targets: [
      // Console output (pretty en dev, JSON en prod)
      {
        target: isDev ? 'pino-pretty' : 'pino/file',
        options: isDev
          ? {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            }
          : {},
      },
      // File output avec rotation
      {
        target: 'pino-roll',
        options: {
          file: `${logFolder}/app.log`,
          size: '100m', // 100MB per file
          maxBackups: 10, // Keep 10 files (1GB total)
          frequency: 'daily', // Also rotate daily
        },
      },
      // Error logs séparés
      {
        level: 'error',
        target: 'pino-roll',
        options: {
          file: `${logFolder}/error.log`,
          size: '50m',
          maxBackups: 20,
        },
      },
    ],
  });

  const logger = pino(
    {
      level: logLevel,
      redact: {
        paths: [
          'password',
          'token',
          'accessToken',
          'refreshToken',
          'secret',
          '*.password',
          '*.token',
          'creditCard',
          'cvv',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req: any) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          ip: req.ip,
        }),
        res: (res: any) => ({
          statusCode: res.statusCode,
          responseTime: res.responseTime,
        }),
      },
    },
    transport
  );

  return logger;
}

/**
 * Singleton logger instance
 */
let loggerInstance: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

/**
 * Log helper functions
 */
export function logInfo(message: string, data?: any) {
  getLogger().info(data || {}, message);
}

export function logError(message: string, error: any, data?: any) {
  getLogger().error({ error: error instanceof Error ? error.message : error, ...data }, message);
}

export function logWarn(message: string, data?: any) {
  getLogger().warn(data || {}, message);
}

export function logDebug(message: string, data?: any) {
  getLogger().debug(data || {}, message);
}

export function logMetrics(metrics: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
}) {
  getLogger().info(metrics, 'API_METRICS');
}
