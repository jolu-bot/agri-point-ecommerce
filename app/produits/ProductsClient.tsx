'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, X, Leaf, ChevronDown, Sprout, ShoppingBag, FlaskConical, Building2, Handshake, Package, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/models/Product';
import toast from 'react-hot-toast';
import type { ComponentType } from 'react';

const categories: { value: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: 'all', label: 'Tout voir', Icon: LayoutGrid },
  { value: 'biofertilisant', label: 'Biofertilisants', Icon: Sprout },
  { value: 'engrais_mineral', label: 'Engrais Minéraux', Icon: FlaskConical },
  { value: 'kit_urbain', label: 'Kits Producteur', Icon: Building2 },
  { value: 'service', label: 'Services', Icon: Handshake },
  { value: 'autre', label: 'Autres', Icon: Package },
];

const sortOptions = [
  { value: 'featured', label: 'En vedette' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix ↑' },
  { value: 'price-desc', label: 'Prix ↓' },
  { value: 'name', label: 'A → Z' },
];

export default function ProductsClient({
  initialProducts = [],
  initialSearch = '',
}: {
  initialProducts?: IProduct[];
  initialSearch?: string;
}) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
    } else {
      loadProducts();
    }
  }, [initialProducts]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    filtered = filtered.filter((p) => {
      const price = p.promoPrice || p.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    filtered = filtered.filter((p) => p.isActive && p.stock > 0);

    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 500000 });
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    priceRange.min > 0 ||
    priceRange.max < 500000;

  const activeCount = products.filter((p) => p.isActive && p.stock > 0).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement des produits…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ─── Hero boutique ─────────────────────────────────────────── */}
      <div className="relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/[0.05] overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-600/8 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200 dark:border-emerald-700/40 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Leaf className="w-3 h-3" />
                Offres Agripoint Services
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
                <span className="text-red-500">Nos</span>{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                  Produits
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl">
                Solutions biofertilisantes de qualité pour une agriculture performante et durable.
              </p>
            </div>

            {/* Stats chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{activeCount} produits</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200/70 dark:border-red-800/40">
                <Sprout className="w-4 h-4 text-red-700 dark:text-red-400" />
                <span className="text-sm font-bold text-red-800 dark:text-red-300">{featuredCount} vedettes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/40">
                <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-bold text-teal-700 dark:text-teal-300">100% Bio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Barre de recherche sticky ─────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.05] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white text-emerald-700 rounded-full text-xs font-bold flex items-center justify-center">!</span>
              )}
            </button>

            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Vue grille"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="filter-category" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Catégorie
                      </label>
                      <select
                        id="filter-category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="price-min" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Prix min (FCFA)
                      </label>
                      <input
                        id="price-min"
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>
                    <div>
                      <label htmlFor="price-max" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Prix max (FCFA)
                      </label>
                      <input
                        id="price-max"
                        type="number"
                        placeholder="999999"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      ✕ Réinitialiser tous les filtres
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ─── Pills catégories ──────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap border ${
                selectedCategory === cat.value
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <cat.Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Barre résultats + tri ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-gray-900 dark:text-white text-base">
              {filteredProducts.length}
            </span>{' '}
            produit{filteredProducts.length > 1 ? 's' : ''}
            {hasActiveFilters && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                · filtré{filteredProducts.length > 1 ? 's' : ''}
              </span>
            )}
          </p>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium hover:border-emerald-400 transition-colors"
            >
              <span className="hidden xs:inline text-gray-400 text-xs">Tri :</span>
              {sortOptions.find((s) => s.value === sortBy)?.label}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Grille produits ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                >
                  <ProductCard product={product as unknown as IProduct} viewMode={viewMode} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mb-5">
                <Sprout className="w-9 h-9 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

