'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, Package,
  ChevronLeft, Check, Star, Leaf, ArrowRight, AlertTriangle, FlaskConical,
  Sprout, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumb from '@/components/shared/Breadcrumb';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  promoPrice?: number;
  stock: number;
  images: string[];
  sku: string;
  weight?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  features?: {
    npk?: string;
    composition?: string;
    applications?: string[];
    dosage?: string;
    cultures?: string[];
    benefits?: string[];
    precautions?: string[];
  };
  metaTitle?: string;
  metaDescription?: string;
}

type Tab = 'description' | 'composition' | 'avis';

export default function ProductDetailClient({ initialProduct }: { initialProduct?: Product }) {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const en = locale === 'en';

  const MOCK_REVIEWS = [
    { name: 'Jean-Pierre M.', rating: 5, date: en ? 'January 2026' : 'Janvier 2026', text: en ? 'Results visible from the 2nd week. My production has clearly increased!' : 'Résultats visibles dès la 2e semaine. Ma production a nettement augmenté !' },
    { name: 'Marie K.', rating: 5, date: en ? 'December 2025' : 'Décembre 2025', text: en ? 'High quality product and fast delivery. I highly recommend it.' : 'Produit de grande qualité et livraison rapide. Je recommande vivement.' },
    { name: 'Thomas B.', rating: 4, date: en ? 'November 2025' : 'Novembre 2025', text: en ? 'Very good product, easy dosage to follow. I will buy again.' : 'Très bon produit, dosage facile à respecter. Je rachèterai.' },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'description', label: 'Description', icon: <Info className="w-4 h-4" /> },
    { id: 'composition', label: en ? 'Composition & Usage' : 'Composition & Usage', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'avis', label: en ? 'Customer Reviews' : 'Avis clients', icon: <Star className="w-4 h-4" /> },
  ];

  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (initialProduct) {
      loadRelated(initialProduct.category, initialProduct._id);
    } else {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        loadRelated(data.product.category, data.product._id);
      } else {
        toast.error(en ? 'Product not found' : 'Produit non trouvé');
        router.push('/produits');
      }
    } catch (error) {
      console.error('Erreur chargement produit:', error);
      toast.error(en ? 'Loading error' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadRelated = async (category: string, currentId: string) => {
    try {
      const res = await fetch(`/api/products?category=${category}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        setRelated((data.products || []).filter((p: Product) => p._id !== currentId).slice(0, 3));
      }
    } catch { /* silently ignore */ }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) { toast.error(en ? 'Out of stock' : 'Rupture de stock'); return; }
    if (quantity > product.stock) { toast.error(en ? `Only ${product.stock} available` : `Seulement ${product.stock} disponible(s)`); return; }
    const store = useCartStore.getState();
    const existing = store.items.find(i => i.id === product._id);
    if (existing) {
      store.updateQuantity(product._id, existing.quantity + quantity);
    } else {
      store.addItem({ id: product._id, name: product.name, slug: product.slug, price: product.price, promoPrice: product.promoPrice, image: product.images[0] || '/images/fallback-product.svg', maxStock: product.stock });
      if (quantity > 1) store.updateQuantity(product._id, quantity);
    }
    toast.success(en ? `${quantity} item(s) added to cart!` : `${quantity} article(s) ajouté(s) au panier !`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, text: product?.description, url: window.location.href }); }
      catch { /* user dismissed */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(en ? 'Link copied!' : 'Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{en ? 'Loading...' : 'Chargement...'}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.promoPrice || product.price;
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.promoPrice!) / product.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* JSON-LD Product schema — rendered server-side when initialProduct is available */}
      {!initialProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: product.images.length > 0 ? product.images : undefined,
              sku: product.sku,
              url: `https://agri-ps.com/produits/${product.slug}`,
              brand: {
                '@type': 'Brand',
                name: 'AGRIPOINT SERVICES',
              },
              offers: {
                '@type': 'Offer',
                url: `https://agri-ps.com/produits/${product.slug}`,
                priceCurrency: 'XAF',
                price: product.promoPrice ?? product.price,
                availability:
                  product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'AGRIPOINT SERVICES',
                },
              },
            }),
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: en ? 'Products' : 'Produits', href: '/produits' },
            { label: product.name },
          ]}
          className="mb-6"
        />

        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          {en ? 'Back' : 'Retour'}
        </button>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* ── Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] shadow-sm">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sprout className="w-20 h-20 text-emerald-300 dark:text-emerald-700" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isFeatured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 text-xs font-black rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-amber-900" /> {en ? 'Featured' : 'Vedette'}
                  </span>
                )}
                {product.isNew && (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">{en ? 'NEW' : 'NOUVEAU'}</span>
                )}
                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">-{discountPercent}%</span>
                )}
              </div>

              {/* Share / heart */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                <button onClick={handleShare} aria-label={en ? 'Share' : 'Partager'} className="w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow border border-gray-100 dark:border-white/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button aria-label={en ? 'Add to wishlist' : 'Ajouter aux favoris'} className="w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow border border-gray-100 dark:border-white/10 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <span className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl tracking-wider">{en ? 'OUT OF STOCK' : 'RUPTURE DE STOCK'}</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="inline-block self-start text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[11px] tracking-widest bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full mb-3">
              {product.category.replace('_', ' ')}
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{en ? '4.9 ★ 24 reviews' : '4.9 ★ 24 avis'}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-black text-gradient-primary leading-none">
                {finalPrice.toLocaleString()}
                <span className="text-lg ml-1 text-emerald-700 dark:text-emerald-400">FCFA</span>
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through">{product.price.toLocaleString()} FCFA</span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <Check className="w-4 h-4" /> {en ? `In stock (${product.stock} available)` : `En stock (${product.stock} disponibles)`}
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-orange-500 text-sm font-semibold">
                  <Package className="w-4 h-4" /> {en ? `Only ${product.stock} left in stock!` : `Plus que ${product.stock} en stock !`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-500 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" /> {en ? 'Out of stock' : 'Rupture de stock'}
                </span>
              )}
            </div>

            {/* NPK badge */}
            {product.features?.npk && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-2.5 mb-5 self-start">
                <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">{en ? 'NPK Formula' : 'Formule NPK'}</p>
                  <p className="text-emerald-900 dark:text-emerald-200 text-xl font-black">{product.features.npk}</p>
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{en ? 'Quantity' : 'Quantité'}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label={en ? 'Decrease' : 'Diminuer'} className="px-3.5 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number" min="1" max={product.stock} value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      aria-label={en ? 'Quantity' : 'Quantité'}
                      className="w-14 text-center py-3 bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none text-sm"
                    />
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label={en ? 'Increase' : 'Augmenter'} className="px-3.5 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{product.stock} {en ? 'avail.' : 'dispo.'}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all hover:shadow-emerald-600/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base mb-8"
            >
              <ShoppingCart className="w-5 h-5" />
              {en ? 'Add to cart' : 'Ajouter au panier'}
            </button>

            {/* Benefits strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: en ? 'Delivery' : 'Livraison', sub: en ? 'Across Cameroon' : 'Partout au Cameroun' },
                { icon: <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: en ? 'Guaranteed' : 'Garanti', sub: en ? 'Certified quality' : 'Qualité certifiée' },
                { icon: <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: en ? 'Packaging' : 'Emballage', sub: en ? 'Optimal protection' : 'Protection optimale' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-white/[0.06]">
                  <div className="mb-1">{b.icon}</div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{b.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm mb-12 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 dark:border-white/[0.06] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {activeTab === 'description' && (
                <div className="space-y-8">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{product.description}</p>
                  </div>

                  {product.features?.cultures && product.features.cultures.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {en ? 'Suitable Crops' : 'Cultures adaptées'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.features.cultures.map((c, i) => (
                          <span key={i} className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-100 dark:border-emerald-900/50">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.features?.benefits && product.features.benefits.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {en ? 'Benefits' : 'Bénéfices'}
                      </h3>
                      <ul className="space-y-2.5">
                        {product.features.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'composition' && (
                <div className="space-y-8">
                  {product.features?.npk && (
                    <div className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                      <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-0.5">{en ? 'NPK Formula' : 'Formule NPK'}</p>
                        <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{product.features.npk}</p>
                      </div>
                    </div>
                  )}

                  {product.features?.composition && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{en ? 'Composition' : 'Composition'}</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        {product.features.composition}
                      </p>
                    </div>
                  )}

                  {product.features?.dosage && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{en ? 'Recommended Dosage' : 'Dosage recommandé'}</h3>
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-3">
                        <span className="text-amber-500 text-xl flex-shrink-0">⚗️</span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{product.features.dosage}</p>
                      </div>
                    </div>
                  )}

                  {product.features?.applications && product.features.applications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{en ? 'Application Method' : "Mode d'application"}</h3>
                      <ol className="space-y-3">
                        {product.features.applications.map((a, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{a}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {product.features?.precautions && product.features.precautions.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-500" /> {en ? 'Precautions' : "Précautions d'emploi"}
                      </h3>
                      <ul className="space-y-2">
                        {product.features.precautions.map((p, i) => (
                          <li key={i} className="flex items-start gap-2.5 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fiche technique */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{en ? 'Technical Sheet' : 'Fiche technique'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { label: en ? 'Reference (SKU)' : 'Référence (SKU)', value: product.sku },
                        product.weight ? { label: en ? 'Weight' : 'Poids', value: `${product.weight} kg` } : null,
                      ].filter(Boolean).map((row, i) => (
                        <div key={i} className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{row!.label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{row!.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'avis' && (
                <div className="space-y-6">
                  {/* Overall rating */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                    <div className="text-center">
                      <p className="text-5xl font-black text-gradient-primary">4.9</p>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{en ? '24 reviews' : '24 avis'}</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {([5,4,3,2,1] as const).map(s => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4">{s}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full bg-amber-400 rounded-full ${
                              s === 5 ? 'w-4/5' : s === 4 ? 'w-[15%]' : 'w-[5%]'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="space-y-4">
                    {MOCK_REVIEWS.map((r, i) => (
                      <div key={i} className="p-5 border border-gray-100 dark:border-white/[0.06] rounded-2xl bg-white dark:bg-gray-900/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</p>
                          <span className="text-xs text-gray-400">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic">&ldquo;{r.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{en ? 'You may also like' : 'Vous aimerez aussi'}</h2>
              <Link href={`/produits?category=${product.category}`} className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                {en ? 'See more' : 'Voir plus'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link key={rel._id} href={`/produits/${rel.slug}`} className="group block">
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-emerald-50/20 dark:from-gray-800 dark:to-emerald-950/20 overflow-hidden">
                      {rel.images[0] ? (
                        <Image src={rel.images[0]} alt={rel.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sprout className="w-12 h-12 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide mb-1">{rel.category.replace('_', ' ')}</p>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{rel.name}</h3>
                      <p className="text-base font-black text-gradient-primary">{(rel.promoPrice || rel.price).toLocaleString()} <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">FCFA</span></p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Mobile sticky CTA ── */}
        {product.stock > 0 && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-white/[0.06] px-4 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-black text-gradient-primary leading-none">{finalPrice.toLocaleString()} FCFA</p>
                {hasDiscount && <p className="text-xs text-gray-400 line-through">{product.price.toLocaleString()}</p>}
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-sm hover:shadow-emerald-600/30"
              >
                <ShoppingCart className="w-4 h-4" />
                {en ? 'Add to cart' : 'Ajouter au panier'}
              </button>
            </div>
          </div>
        )}
        {/* Spacer for sticky bar */}
        <div className="lg:hidden h-20" />
      </div>
    </div>
  );
}
