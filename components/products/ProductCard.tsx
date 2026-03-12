'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Eye, Star, ArrowRight, Sprout, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { IProduct } from '@/models/Product';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem } = useCartStore();

  const finalPrice = product.promoPrice || product.price;
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (product.stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      promoPrice: product.promoPrice,
      image: product.images[0] || '/images/fallback-product.svg',
      maxStock: product.stock,
    });

    toast.success('Produit ajouté au panier !');
  };
  /* ─────────────────── VUE LISTE ─────────────────── */
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <Link href={`/produits/${product.slug}`} className="group block">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-[border-color,box-shadow] duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-0">
              {/* Image */}
              <div className="relative w-full sm:w-52 md:w-64 h-52 bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-800 dark:to-emerald-950/20 flex-shrink-0 overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/fallback-product.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sprout className="w-16 h-16 text-emerald-300 dark:text-emerald-700" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isFeatured && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-br from-red-700 to-amber-500 text-white text-[10px] font-bold rounded-lg shadow-sm shadow-red-900/20">
                      <Star className="w-3 h-3 fill-white" /> Vedette
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                      NOUVEAU
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-2.5 py-0.5 bg-[#B71C1C] text-white text-[10px] font-bold rounded-full shadow">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg text-xs tracking-wide">
                      RUPTURE DE STOCK
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-block text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px] tracking-widest bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                    {product.category.replace('_', ' ')}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {product.stock} restant{product.stock > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200 text-lg leading-tight mb-2">
                  {product.name}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 line-clamp-2 text-sm leading-relaxed mb-3 flex-1">
                  {product.description}
                </p>

                {product.features?.cultures && product.features.cultures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.features.cultures.slice(0, 4).map((culture, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-700"
                      >
                        {culture}
                      </span>
                    ))}
                    {product.features.cultures.length > 4 && (
                      <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                        +{product.features.cultures.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06] mt-auto">
                  <div>
                    {hasDiscount && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 line-through mb-0.5">
                        {product.price.toLocaleString()} FCFA
                      </div>
                    )}
                    <div className="text-2xl font-black text-gradient-primary leading-none">
                      {finalPrice.toLocaleString()}
                      <span className="text-sm font-semibold ml-1 text-emerald-700 dark:text-emerald-400">FCFA</span>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    whileTap={product.stock > 0 ? { scale: 0.94 } : undefined}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl transition-colors duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed shadow-sm hover:shadow-emerald-600/30 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ─────────────────── VUE GRILLE (PREMIUM) ─────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="h-full"
    >
      <Link href={`/produits/${product.slug}`} className="group block h-full">
        <div className={`relative h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl border transition-[border-color,box-shadow] duration-300 overflow-hidden
          ${product.isFeatured
            ? 'border-red-300/50 dark:border-red-800/40 shadow-[0_0_0_1px_rgba(185,28,28,0.12)]'
            : 'border-gray-100 dark:border-white/[0.06]'}
          hover:shadow-[0_12px_48px_rgba(16,163,74,0.22)] hover:border-emerald-200 dark:hover:border-emerald-700/50
        `}>

          {/* ── Image Container ── */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-800 dark:to-emerald-950/20 overflow-hidden rounded-t-2xl">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/fallback-product.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sprout className="w-16 h-16 text-emerald-300 dark:text-emerald-700" />
              </div>
            )}

            {/* Gradient overlay bottom (for hover CTA) */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover CTA "Voir le produit" */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span className="flex items-center gap-1.5 text-white text-xs font-semibold tracking-wide">
                Voir le produit <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Badges top-left */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              {product.isNew && (
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow">
                  NOUVEAU
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-0.5 bg-[#B71C1C] text-white text-[10px] font-bold rounded-full shadow">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Featured badge top-right */}
            {product.isFeatured && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-br from-red-700 to-amber-500 text-white text-[10px] font-black rounded-full shadow shadow-red-900/30">
                  <Star className="w-2.5 h-2.5 fill-white" /> Vedette
                </span>
              </div>
            )}

            {/* Quick Actions (hover) */}
            {!product.isFeatured && (
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-10">
                <motion.button
                  aria-label="Ajouter aux favoris"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-xl shadow hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-500 dark:text-gray-400 transition-colors border border-gray-100 dark:border-white/10"
                >
                  <Heart className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  aria-label="Aperçu rapide"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-xl shadow hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-500 dark:text-gray-400 transition-colors border border-gray-100 dark:border-white/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}

            {/* Stock */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow">
                  <Flame className="w-3 h-3" /> {product.stock} restant{product.stock > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs tracking-widest">
                  RUPTURE DE STOCK
                </span>
              </div>
            )}
          </div>

          {/* ── Card Content ── */}
          <div className="flex flex-col flex-1 p-4 gap-2">
            {/* Category */}
            <span className="inline-block self-start text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px] tracking-widest bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
              {product.category.replace('_', ' ')}
            </span>

            {/* Name */}
            <h3 className="font-bold text-[15px] leading-snug text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
              {product.description}
            </p>

            {/* Feature tags */}
            {product.features?.cultures && product.features.cultures.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.features.cultures.slice(0, 2).map((culture, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] rounded-full border border-gray-200 dark:border-gray-700"
                  >
                    {culture}
                  </span>
                ))}
                {product.features.cultures.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[10px] rounded-full border border-gray-200 dark:border-gray-700">
                    +{product.features.cultures.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* ── Price & CTA ── */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] mt-auto">
              {/* Price row */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-black text-gradient-primary leading-none">
                  {finalPrice.toLocaleString()}
                  <span className="text-xs font-semibold ml-0.5 text-emerald-700 dark:text-emerald-400"> FCFA</span>
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                    {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Add to Cart — full width */}
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                whileTap={product.stock > 0 ? { scale: 0.94 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors duration-200 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed shadow-sm hover:shadow-emerald-600/30 group/btn"
                aria-label="Ajouter au panier"
              >
                <ShoppingCart className="w-4 h-4 group-hover/btn:animate-bounce" />
                <span>Ajouter au panier</span>
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Skeleton placeholder shown while product data is loading ── */
export function ProductCardSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden animate-pulse">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-5/6" />
        </div>
        <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] mt-auto">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
