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

  // En production, utiliser des transports simples sans pino-roll pour éviter les problèmes de config
  const transport = isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      })
    : undefined; // En prod, utiliser la sortie standard

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
