'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
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
      image: product.images[0] || '/placeholder-product.jpg',
      maxStock: product.stock,
    });

    toast.success('Produit ajouté au panier !');
  };
  if (viewMode === 'list') {
    return (
      <Link href={`/produits/${product.slug}`} className="group">
        <div className="card hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-fluid-sm">
            {/* Image */}
            <div className="relative w-full md:w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-fluid-lg overflow-hidden flex-shrink-0">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🌱
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-fluid-xs">
                {product.isNew && (
                  <span className="px-2 py-1 gradient-primary text-white font-bold rounded-fluid shadow-md product-tag">
                    NOUVEAU
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2 py-1 gradient-secondary text-white font-bold rounded-fluid shadow-md product-tag">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-4 py-2 bg-red-600 text-white font-bold rounded text-sm">
                    RUPTURE DE STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <div className="text-primary-600 dark:text-primary-400 font-semibold uppercase product-category">
                {product.category.replace('_', ' ')}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors product-title">
                {product.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 line-clamp-3 product-description">
                {product.description}
              </p>

              {product.features?.cultures && product.features.cultures.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.features.cultures.slice(0, 3).map((culture, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 rounded"
                    >
                      {culture}
                    </span>
                  ))}
                  {product.features.cultures.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 rounded">
                      +{product.features.cultures.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {hasDiscount && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {product.price.toLocaleString()} FCFA
                    </div>
                  )}
                  <div className="font-display text-lg font-bold text-gradient-primary">
                    {finalPrice.toLocaleString()} FCFA
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-xs text-orange-500 font-medium">
                      Seulement {product.stock} en stock
                    </span>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Ajouter au panier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/produits/${product.slug}`} className="group">
      <div className="card hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🌱
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-fluid-xs">
            {product.isNew && (
              <span className="px-2 py-1 gradient-primary text-white font-bold rounded-fluid shadow-md product-tag">
                NOUVEAU
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 gradient-secondary text-white font-bold rounded-fluid shadow-md product-tag">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors" aria-label="Ajouter aux favoris">
              <Heart className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors" aria-label="Aperçu rapide">
              <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Stock badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                Dernières pièces
              </span>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-red-600 text-white font-bold rounded">
                RUPTURE DE STOCK
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="product-content">
          {/* Category */}
          <div className="text-primary-600 dark:text-primary-400 font-semibold uppercase product-category">
            {product.category.replace('_', ' ')}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 product-title">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 product-description">
            {product.description}
          </p>

          {/* Features */}
          {product.features?.cultures && product.features.cultures.length > 0 && (
            <div className="flex flex-wrap gap-fluid-xs product-features">
              {product.features.cultures.slice(0, 2).map((culture, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-fluid-sm product-tag"
                >
                  {culture}
                </span>
              ))}
              {product.features.cultures.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-fluid-sm product-tag">
                  +{product.features.cultures.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && (
                <div className="text-gray-500 dark:text-gray-400 line-through product-price-old">
                  {product.price.toLocaleString()} FCFA
                </div>
              )}
              <div className="text-primary-600 dark:text-primary-400 font-bold product-price">
                {finalPrice.toLocaleString()} FCFA
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-fluid-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Ajouter au panier"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
