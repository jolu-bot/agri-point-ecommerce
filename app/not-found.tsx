import Link from 'next/link';
import { Home, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo / brand mark */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl font-black text-red-600">AP</span>
          <span className="text-3xl font-black text-emerald-600">AGRI<span className="text-gray-900 dark:text-white">POINT</span></span>
        </div>

        {/* 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black leading-none text-gray-100 dark:text-gray-800 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-4xl">🌱</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Revenez à l&apos;accueil pour continuer votre navigation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-emerald-600/25"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <Link
            href="/produits"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold transition-all"
          >
            <Package className="w-4 h-4" />
            Nos produits
          </Link>
        </div>
      </div>
    </div>
  );
}
