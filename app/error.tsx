'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry or monitoring in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl font-black text-red-600">AP</span>
          <span className="text-3xl font-black text-emerald-600">AGRI<span className="text-gray-900 dark:text-white">POINT</span></span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou retourner à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-6 font-mono">
            Ref: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-emerald-600/25"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
