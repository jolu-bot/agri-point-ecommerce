import { db, getPendingSyncItems, updateSyncItem, deleteSyncItem } from './db-offline';

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncAll();
      }
    }, intervalMs);

    // Sync immédiatement si en ligne
    if (navigator.onLine) {
      this.syncAll();
    }

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      console.log('📡 Connexion rétablie - Synchronisation...');
      this.syncAll();
    });
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Synchroniser tous les items en attente
  async syncAll(): Promise<{ success: number; errors: number }> {
    if (this.isSyncing) {
      console.log('⏳ Synchronisation déjà en cours...');
      return { success: 0, errors: 0 };
    }

    if (!navigator.onLine) {
      console.log('📵 Mode hors ligne - Synchronisation reportée');
      return { success: 0, errors: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let errorCount = 0;

    try {
      const items = await getPendingSyncItems();
      
      if (items.length === 0) {
        console.log('✅ Aucun élément à synchroniser');
        return { success: 0, errors: 0 };
      }

      console.log(`🔄 Synchronisation de ${items.length} élément(s)...`);

      for (const item of items) {
        try {
          await updateSyncItem(item.id!, { status: 'syncing' });
          
          const result = await this.syncItem(item);
          
          if (result.success) {
            await deleteSyncItem(item.id!);
            successCount++;
            console.log(`✅ ${item.type} synchronisé`);
          } else {
            throw new Error(result.error || 'Erreur inconnue');
          }
        } catch (error: any) {
          errorCount++;
          const newRetries = item.retries + 1;
          
          await updateSyncItem(item.id!, {
            status: 'error',
            retries: newRetries,
            errorMessage: error.message,
          });

          console.error(`❌ Erreur sync ${item.type}:`, error.message);

          // Si trop d'essais, supprimer
          if (newRetries >= 3) {
            console.log(`🗑️ Suppression de l'élément après 3 échecs`);
            await deleteSyncItem(item.id!);
          }
        }
      }

      console.log(`🎉 Synchronisation terminée: ${successCount} succès, ${errorCount} erreurs`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, errors: errorCount };
  }

  // Synchroniser un item spécifique
  private async syncItem(item: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Ajouter un item à la queue et tenter de synchroniser immédiatement
  async queueAndSync(item: Omit<any, 'id' | 'timestamp' | 'retries' | 'status'>) {
    const { addToSyncQueue } = await import('./db-offline');
    const id = await addToSyncQueue(item);
    
    // Si en ligne, tenter de synchroniser immédiatement
    if (navigator.onLine) {
      setTimeout(() => this.syncAll(), 1000);
    }
    
    return id;
  }

  // Obtenir le statut de la synchronisation
  async getStatus() {
    const { getSyncStats } = await import('./db-offline');
    return await getSyncStats();
  }
}

export const syncService = new SyncService();

// Hook React pour utiliser le service de sync
export function useSyncService() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  // @ts-expect-error - React utilisé globalement sans import
  const [syncStats, setSyncStats] = React.useState<any>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Démarrer la synchronisation automatique
    syncService.startAutoSync();

    // Mettre à jour les stats toutes les 5 secondes
    const interval = setInterval(async () => {
      const stats = await syncService.getStatus();
      setSyncStats(stats);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      syncService.stopAutoSync();
    };
  }, []);

  const triggerSync = async () => {
    return await syncService.syncAll();
  };

  const queueItem = async (item: any) => {
    return await syncService.queueAndSync(item);
  };

  return {
    isOnline,
    syncStats,
    triggerSync,
    queueItem,
  };
}

// Polyfill React pour l'import
const React = typeof window !== 'undefined' ? require('react') : { useState: () => [null, () => {}], useEffect: () => {} };
