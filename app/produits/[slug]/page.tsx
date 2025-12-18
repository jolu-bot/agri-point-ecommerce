'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Truck,
  Shield,
  Package,
  ChevronLeft,
  Check,
  Star
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        toast.error('Produit non trouvé');
        router.push('/produits');
      }
    } catch (error) {
      console.error('Erreur chargement produit:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Seulement ${product.stock} disponible(s)`);
      return;
    }

    // Check if item exists
    const existingItem = useCartStore.getState().items.find(item => item.id === product._id);
    
    if (existingItem) {
      // Update quantity for existing item
      const newQuantity = existingItem.quantity + quantity;
      useCartStore.getState().updateQuantity(product._id, newQuantity);
    } else {
      // Add new item with quantity 1
      useCartStore.getState().addItem({
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        promoPrice: product.promoPrice,
        image: product.images[0] || '/placeholder-product.jpg',
        maxStock: product.stock,
      });
      
      // If quantity > 1, update to the desired quantity
      if (quantity > 1) {
        useCartStore.getState().updateQuantity(product._id, quantity);
      }
    }

    toast.success(`${quantity} article(s) ajouté(s) au panier !`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const finalPrice = product.promoPrice || product.price;
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-primary-600 dark:hover:text-primary-400">
            Produits
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            {/* Image principale */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 shadow-lg">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  🌱
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-lg shadow">
                    NOUVEAU
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg shadow">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg text-lg shadow-xl">
                    RUPTURE DE STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-600 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                    }`}
                    aria-label={`Voir l'image ${index + 1} de ${product.name}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase">
              {product.category.replace('_', ' ')}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Reviews (mockup) */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">(24 avis)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {hasDiscount && (
                <div className="text-xl text-gray-500 dark:text-gray-400 line-through mb-1">
                  {product.price.toLocaleString()} FCFA
                </div>
              )}
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                {finalPrice.toLocaleString()} FCFA
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <Check className="w-5 h-5" />
                  En stock ({product.stock} disponibles)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 text-orange-500 font-medium">
                  <Package className="w-5 h-5" />
                  Dernières pièces ({product.stock} restants)
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Rupture de stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* NPK */}
            {product.features?.npk && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
                <div className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">
                  Formule NPK
                </div>
                <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {product.features.npk}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-x border-gray-300 dark:border-gray-600 py-3 bg-transparent focus:outline-none"
                      aria-label="Quantité à ajouter au panier"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.stock} disponible(s)
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Ajouter au panier</span>
              </button>

              <button
                className="p-4 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-600 dark:hover:border-primary-400 rounded-lg transition-colors"
                aria-label="Ajouter aux favoris"
              >
                <Heart className="w-6 h-6" />
              </button>

              <button
                onClick={handleShare}
                className="p-4 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-600 dark:hover:border-primary-400 rounded-lg transition-colors"
                aria-label="Partager"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Livraison rapide
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Partout au Cameroun
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Produit garanti
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Qualité certifiée
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    Emballage sécurisé
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Protection optimale
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          {/* Cultures */}
          {product.features?.cultures && product.features.cultures.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Cultures adaptées
              </h2>
              <div className="flex flex-wrap gap-3">
                {product.features.cultures.map((culture, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium"
                  >
                    {culture}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {product.features?.benefits && product.features.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Bénéfices
              </h2>
              <ul className="space-y-3">
                {product.features.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Applications */}
          {product.features?.applications && product.features.applications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Applications
              </h2>
              <ul className="space-y-3">
                {product.features.applications.map((application, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{application}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dosage */}
          {product.features?.dosage && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dosage recommandé
              </h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">{product.features.dosage}</p>
              </div>
            </div>
          )}

          {/* Précautions */}
          {product.features?.precautions && product.features.precautions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Précautions d&apos;emploi
              </h2>
              <ul className="space-y-2">
                {product.features.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold flex-shrink-0">⚠️</span>
                    <span className="text-gray-700 dark:text-gray-300">{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Infos techniques */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Informations techniques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Référence</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.sku}</span>
              </div>
              {product.weight && (
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Poids</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{product.weight} kg</span>
                </div>
              )}
              {product.features?.composition && (
                <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 block mb-2">Composition</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{product.features.composition}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
