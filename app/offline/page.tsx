import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hors ligne — AGRIPOINT SERVICES',
  robots: { index: false },
};

const CACHED_PAGES = [
  { href: '/produits', label: 'Catalogue produits' },
  { href: '/nos-distributeurs', label: 'Nos distributeurs' },
  { href: '/blog', label: 'Blog agro' },
];

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📡</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Vous êtes hors ligne</h1>
        <p className="text-gray-500 text-sm mb-8">
          Vérifiez votre connexion réseau. Certaines pages restent accessibles en mode hors ligne :
        </p>

        <div className="space-y-2 mb-8">
          {CACHED_PAGES.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition"
            >
              {p.label}
              <span className="text-gray-300">→</span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
