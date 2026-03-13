'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface Suggestion {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  category?: string;
  price?: number;
}

interface SearchAutocompleteProps {
  onClose: () => void;
}

export default function SearchAutocomplete({ onClose }: SearchAutocompleteProps) {
  const router = useRouter();
  const { T, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products || []);
          setShowDropdown(true);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (query.trim()) {
        router.push(`/produits?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    },
    [query, router, onClose]
  );

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/produits/${slug}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-1 animate-fadeInUp">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder={T.nav.search}
            className="w-44 lg:w-64 px-3 py-1.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
          />

          {/* Suggestions dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[280px]">
              {suggestions.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left group"
                >
                  {s.image && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      <Image
                        src={s.image}
                        alt={s.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {s.name}
                    </p>
                    {s.category && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.category}</p>
                    )}
                  </div>
                  {s.price && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {s.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </button>
              ))}
              {/* See all results */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                {locale === 'en' ? `See all results for "${query}"` : `Voir tous les résultats pour "${query}"`}
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/25 transition-all duration-150"
          aria-label={T.nav.search}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
          aria-label={T.nav.close}
        >
          <X className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
