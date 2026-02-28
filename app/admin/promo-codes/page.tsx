'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface PromoCode {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiryDate: string;
  description?: string;
}

export default function PromoManagementPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    maxUses: '',
    expiryDate: '',
    description: '',
  });

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/promo-codes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data.promoCodes || []);
      }
    } catch (error) {
      console.error('Erreur chargement promos:', error);
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.expiryDate) {
      toast.error('Tous les champs sont requis');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/promo-codes?id=${editingId}`
        : '/api/admin/promo-codes';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        }),
      });

      if (response.ok) {
        toast.success(editingId ? 'Code mis à jour' : 'Code créé');
        setFormData({ code: '', type: 'percentage', value: 0, maxUses: '', expiryDate: '', description: '' });
        setEditingId(null);
        setShowForm(false);
        loadPromos();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur serveur');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Codes Promotionnels</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ code: '', type: 'percentage', value: 0, maxUses: '', expiryDate: '', description: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Nouveau Code
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">Code</label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                  placeholder="SAVE20"
                  disabled={editingId !== null}
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valeur</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Utilisations max (optionnel)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date d'expiration</label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg"
                  placeholder="Nouvelle campagne printemps"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ code: '', type: 'percentage', value: 0, maxUses: '', expiryDate: '', description: '' });
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </motion.form>
        )}

        {/* Liste des codes */}
        <div className="grid gap-4">
          {promoCodes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Aucun code promo</p>
            </div>
          ) : (
            promoCodes.map((promo) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-lg">
                      <code className="font-bold text-primary-700 dark:text-primary-300">{promo.code}</code>
                    </div>
                    <button
                      onClick={() => copyCode(promo.code)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copier le code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      title="Modifier ce code"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      title="Supprimer ce code"
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Remise</span>
                    <p className="font-semibold">
                      {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString('fr-FR')} FCFA`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Utilisations</span>
                    <p className="font-semibold">
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Statut</span>
                    <p className={`font-semibold ${promo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {promo.isActive ? '✅ Actif' : '❌ Inactif'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Expire
                    </span>
                    <p className="font-semibold">
                      {new Date(promo.expiryDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {promo.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">{promo.description}</p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
