'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sprout, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  promoPrice?: number;
  images: string[];
  stock: number;
  weight?: number;
  features?: {
    npk?: string;
    dosage?: string;
    cultures?: string[];
    benefits?: string[];
    composition?: string;
  };
}

interface Props {
  products: ProductData[];
}

export default function ProductComparerClient({ products }: Props) {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const router = useRouter();

  const prices  = products.map(p => p.promoPrice ?? p.price);
  const minPrice = Math.min(...prices);

  const thClass   = 'text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-3.5 px-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-white/[0.06]';
  const tdClass   = 'py-3.5 px-4 border-b border-gray-100 dark:border-white/[0.06] text-sm text-gray-700 dark:text-gray-300 text-center align-top';
  const headTd    = 'py-4 px-4 border-b border-gray-100 dark:border-white/[0.06] text-center';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {en ? 'Back to products' : 'Retour aux produits'}
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-8">
          {en ? 'Product Comparison' : 'Comparaison de produits'}
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: `${products.length * 220 + 180}px` }} role="table">
              {/* Product header row */}
              <thead>
                <tr>
                  <th className={thClass + ' w-40'}>{en ? 'Criteria' : 'Critère'}</th>
                  {products.map((p, i) => (
                    <motion.th
                      key={p._id}
                      className={headTd}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div className="relative w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-800 dark:to-emerald-950/20 rounded-xl overflow-hidden">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sprout className="w-10 h-10 text-emerald-300 dark:text-emerald-700" />
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/produits/${p.slug}`}
                        className="font-bold text-sm text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 block"
                      >
                        {p.name}
                      </Link>
                    </motion.th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Price */}
                <tr>
                  <td className={thClass}>{en ? 'Price' : 'Prix'}</td>
                  {products.map(p => {
                    const fp = p.promoPrice ?? p.price;
                    const best = fp === minPrice;
                    return (
                      <td key={p._id} className={`${tdClass} ${best ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}`}>
                        <span className={`font-black text-lg leading-none ${best ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {fp.toLocaleString('fr-FR')}
                          <span className="text-xs ml-0.5">FCFA</span>
                        </span>
                        {best && (
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            {en ? '✓ Best price' : '✓ Meilleur prix'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Category */}
                <tr>
                  <td className={thClass}>{en ? 'Category' : 'Catégorie'}</td>
                  {products.map(p => (
                    <td key={p._id} className={tdClass}>
                      <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                        {p.category.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* NPK */}
                <tr>
                  <td className={thClass}>NPK</td>
                  {products.map(p => (
                    <td key={p._id} className={tdClass}>
                      {p.features?.npk
                        ? <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{p.features.npk}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  ))}
                </tr>

                {/* Dosage */}
                <tr>
                  <td className={thClass}>{en ? 'Dosage' : 'Dosage'}</td>
                  {products.map(p => (
                    <td key={p._id} className={`${tdClass} text-left`}>
                      {p.features?.dosage ?? <span className="text-gray-400">—</span>}
                    </td>
                  ))}
                </tr>

                {/* Crops */}
                <tr>
                  <td className={thClass}>{en ? 'Crops' : 'Cultures'}</td>
                  {products.map(p => (
                    <td key={p._id} className={tdClass}>
                      {p.features?.cultures?.length ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {p.features.cultures.slice(0, 4).map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] rounded-full">{c}</span>
                          ))}
                          {p.features.cultures.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{p.features.cultures.length - 4}</span>
                          )}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                  ))}
                </tr>

                {/* Benefits count */}
                <tr>
                  <td className={thClass}>{en ? 'Benefits' : 'Avantages'}</td>
                  {products.map(p => {
                    const count   = p.features?.benefits?.length ?? 0;
                    const maxBen  = Math.max(...products.map(q => q.features?.benefits?.length ?? 0));
                    const isBest  = count > 0 && count === maxBen;
                    return (
                      <td key={p._id} className={`${tdClass} ${isBest ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}`}>
                        {count > 0
                          ? <span className={`font-semibold ${isBest ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{count}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* Weight / Volume */}
                <tr>
                  <td className={thClass}>{en ? 'Volume / Weight' : 'Volume / Poids'}</td>
                  {products.map(p => (
                    <td key={p._id} className={tdClass}>
                      {p.weight
                        ? <span className="font-semibold text-gray-900 dark:text-white">{p.weight} {p.category === 'biofertilisant' ? 'L' : 'kg'}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr>
                  <td className={thClass}>{en ? 'Availability' : 'Disponibilité'}</td>
                  {products.map(p => (
                    <td key={p._id} className={tdClass}>
                      {p.stock > 0
                        ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs"><Check className="w-3.5 h-3.5" />{en ? 'In stock' : 'En stock'}</span>
                        : <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold"><X className="w-3.5 h-3.5" />{en ? 'Out of stock' : 'Rupture'}</span>}
                    </td>
                  ))}
                </tr>

                {/* CTA */}
                <tr>
                  <td className="py-4 px-4 bg-gray-50 dark:bg-gray-900/50" />
                  {products.map(p => (
                    <td key={p._id} className="py-4 px-4 text-center">
                      <Link
                        href={`/produits/${p.slug}`}
                        className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        {en ? 'View product' : 'Voir le produit'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
