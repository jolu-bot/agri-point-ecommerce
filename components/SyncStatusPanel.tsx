'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Loader, Database } from 'lucide-react';
import { syncService } from '@/lib/sync-service';

export default function SyncStatusPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    syncing: 0,
    errors: 0,
    success: 0,
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Démarrer la synchronisation automatique
    syncService.startAutoSync();

    // Mettre à jour les stats
    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateStats = async () => {
    const newStats = await syncService.getStatus();
    setStats(newStats);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncAll();
      await updateStats();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Ne rien afficher si tout est OK
  if (stats.pending === 0 && stats.errors === 0 && isOnline) {
    return null;
  }

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 md:bottom-4 md:right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isOnline
            ? stats.errors > 0
              ? 'bg-red-600 hover:bg-red-700'
              : stats.pending > 0
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-600 hover:bg-gray-700'
        } text-white transition-colors`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isSyncing ? (
          <Loader className="w-6 h-6 animate-spin" />
        ) : stats.errors > 0 ? (
          <AlertCircle className="w-6 h-6" />
        ) : stats.pending > 0 ? (
          <RefreshCw className="w-6 h-6" />
        ) : (
          <Database className="w-6 h-6" />
        )}
        
        {stats.pending > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {stats.pending}
          </span>
        )}
      </motion.button>

      {/* Panel de détails */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-36 md:bottom-20 right-4 z-40 w-80 bg-white rounded-lg shadow-2xl border border-gray-200"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Synchronisation
                </h3>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isOnline
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                {stats.pending > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-orange-600" />
                      En attente
                    </span>
                    <span className="font-semibold text-orange-600">
                      {stats.pending}
                    </span>
                  </div>
                )}

                {stats.syncing > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                      Synchronisation
                    </span>
                    <span className="font-semibold text-blue-600">
                      {stats.syncing}
                    </span>
                  </div>
                )}

                {stats.errors > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Erreurs
                    </span>
                    <span className="font-semibold text-red-600">
                      {stats.errors}
                    </span>
                  </div>
                )}

                {stats.success > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Synchronisés
                    </span>
                    <span className="font-semibold text-green-600">
                      {stats.success}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  {isOnline
                    ? stats.pending > 0
                      ? 'Les modifications en attente seront synchronisées automatiquement.'
                      : 'Toutes vos données sont à jour.'
                    : 'Mode hors ligne activé. Les modifications seront synchronisées à la reconnexion.'}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={handleManualSync}
                disabled={!isOnline || isSyncing}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Synchroniser maintenant
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
