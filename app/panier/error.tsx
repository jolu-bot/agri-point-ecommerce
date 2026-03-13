'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PanierError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🌱</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Une erreur est survenue
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Nous n&apos;avons pas pu charger votre panier. Veuillez réessayer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/produits"
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    </div>
  );
}
