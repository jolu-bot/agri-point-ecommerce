'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Package,
  Boxes,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  promoPrice?: number;
  stock: number;
  images: string[];
  status: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  // Stock management
  const [showStockModal, setShowStockModal] = useState(false);
  const [productForStock, setProductForStock] = useState<Product | null>(null);
  const [stockOperation, setStockOperation] = useState<'set' | 'add' | 'subtract'>('set');
  const [stockValue, setStockValue] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  const categories = [
    'all',
    'engrais-npk',
    'fertilisants',
    'bio-stimulants',
    'kits-urbains',
    'accessoires',
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Produit supprimé');
        setProducts(products.filter(p => p._id !== productToDelete));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        toast.error('Erreur de suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur serveur');
    }
  };

  const openStockModal = (product: Product) => {
    setProductForStock(product);
    setStockOperation('set');
    setStockValue(product.stock.toString());
    setStockReason('');
    setShowStockModal(true);
  };

  const handleStockUpdate = async () => {
    if (!productForStock || !stockValue) return;
    const value = parseInt(stockValue, 10);
    if (isNaN(value) || value < 0) { toast.error('Valeur invalide'); return; }
    setStockLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/products/${productForStock._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ operation: stockOperation, value, reason: stockReason }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(products.map(p =>
          p._id === productForStock._id ? { ...p, stock: data.product.newStock } : p
        ));
        toast.success(`Stock mis à jour : ${data.product.newStock} unités`);
        setShowStockModal(false);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur mise à jour stock');
      }
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setStockLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                       product.slug.includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Produits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un produit</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label htmlFor="category-filter" className="sr-only">Filtrer par catégorie</label>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              aria-label="Filtrer les produits par catégorie"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {product.promoPrice ? (
                          <>
                            <span className="text-gray-500 dark:text-gray-400 line-through mr-2">
                              {product.price.toLocaleString('fr-FR')} FCFA
                            </span>
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {product.promoPrice.toLocaleString('fr-FR')} FCFA
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {product.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        product.stock > 10
                          ? 'text-green-600 dark:text-green-400'
                          : product.stock > 0
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.stock} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {product.stock > 0 ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/produits/${product.slug}`, '_blank')}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openStockModal(product)}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          title="Gérer le stock"
                        >
                          <Boxes className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setProductToDelete(product._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucun produit trouvé
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Stock Management Modal */}
      {showStockModal && productForStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Boxes className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Gérer le stock</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{productForStock.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 mb-5 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stock actuel</span>
              <span className={`text-lg font-black ${
                productForStock.stock === 0 ? 'text-red-600' :
                productForStock.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {productForStock.stock} unités
              </span>
            </div>

            <div className="space-y-4">
              {/* Operation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Opération</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['set', 'add', 'subtract'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => setStockOperation(op)}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                        stockOperation === op
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {op === 'set' ? 'Définir' : op === 'add' ? '+ Ajouter' : '− Retirer'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {stockOperation === 'set' ? 'Nouveau stock' : stockOperation === 'add' ? 'Quantité à ajouter' : 'Quantité à retirer'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                />
                {stockOperation !== 'set' && stockValue && (
                  <p className="text-xs text-gray-500 mt-1">
                    Résultat estimé : {
                      stockOperation === 'add'
                        ? productForStock.stock + parseInt(stockValue || '0')
                        : Math.max(0, productForStock.stock - parseInt(stockValue || '0'))
                    } unités
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Motif <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex : Réapprovisionnement fournisseur"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleStockUpdate}
                disabled={stockLoading || !stockValue}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors font-semibold"
              >
                {stockLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Valider
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
