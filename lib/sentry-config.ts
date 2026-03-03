/**
 * SENTRY CONFIGURATION — Next.js Error Tracking
 * - Automatic error capturing
 * - Performance monitoring
 * - Session replay
 * - Source maps upload
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% perf trace sampling (reduce ingest costs)
    replaysSessionSampleRate: 0.05, // 5% session replay sampling
    replaysOnErrorSampleRate: 1.0, // 100% replay on errors
    integrations: [
      // Session replay is configured via replaysSessionSampleRate
    ],
    // Ignore errors from browser extensions or local development
    ignoreErrors: [
      'non-Error promise rejection captured',
      'chrome-extension://',
      'moz-extension://',
    ],
    // Hooks for filtering
    beforeSend(event, hint) {
      // Don't send 404 errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message?.includes('404')) {
          return null;
        }
      }
      return event;
    },
  });
}

export { Sentry };
