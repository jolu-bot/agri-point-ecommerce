'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Calendar, LogOut, ShoppingBag, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/auth/login?redirect=/compte');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Non autorisé');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Erreur authentification:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/auth/login?redirect=/compte');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { label: string; color: string } } = {
      admin: { label: 'Administrateur', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      redacteur: { label: 'Rédacteur', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      assistant_ia: { label: 'Assistant IA', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      client: { label: 'Client', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
    };

    return badges[role] || badges.client;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Compte</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Carte utilisateur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-primary-700 dark:text-primary-300">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {user.email}
                </p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3 text-sm">
                  {user.phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Actions rapides
              </h3>
              <div className="space-y-2">
                {['admin', 'manager', 'redacteur'].includes(user.role) && (
                  <Link
                    href="/admin"
                    className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Shield className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Accéder au panel admin</span>
                  </Link>
                )}
                <Link
                  href="/compte/security"
                  className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Shield className="w-5 h-5 mr-3 text-blue-600" />
                  <span>Sécurité & Code Unique</span>
                </Link>
                <Link
                  href="/compte/commandes"
                  className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ShoppingBag className="w-5 h-5 mr-3 text-primary-600" />
                  <span>Mes commandes</span>
                </Link>
                <button className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                  <Settings className="w-5 h-5 mr-3 text-primary-600" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    readOnly
                    aria-label="Nom complet"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    aria-label="Adresse email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={user.phone || 'Non renseigné'}
                    readOnly
                    aria-label="Numéro de téléphone"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <div className="flex items-center h-10">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission: string) => (
                    <span
                      key={permission}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Mon activité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Commandes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Produits favoris</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">0 FCFA</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total dépensé</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
