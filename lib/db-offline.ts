import Dexie, { Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  type: 'order' | 'cart' | 'favorite' | 'review' | 'contact';
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface CachedData {
  id?: number;
  key: string;
  type: 'product' | 'page' | 'category' | 'user';
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class AppDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>;
  cachedData!: Table<CachedData, number>;

  constructor() {
    super('AgriPointDB');
    
    this.version(1).stores({
      syncQueue: '++id, type, status, timestamp',
      cachedData: '++id, key, type, expiresAt',
    });
  }
}

export const db = new AppDatabase();

// Fonctions utilitaires

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>) {
  return await db.syncQueue.add({
    ...item,
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
  });
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await db.syncQueue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('error')
    .and((item) => item.retries < 3)
    .sortBy('timestamp');
}

export async function updateSyncItem(id: number, updates: Partial<SyncQueueItem>) {
  return await db.syncQueue.update(id, updates);
}

export async function deleteSyncItem(id: number) {
  return await db.syncQueue.delete(id);
}

export async function cacheData(key: string, type: CachedData['type'], data: any, expiresInMs: number = 3600000) {
  const expiresAt = Date.now() + expiresInMs;
  
  // Supprimer l'ancien cache pour cette clé
  await db.cachedData.where('key').equals(key).delete();
  
  return await db.cachedData.add({
    key,
    type,
    data,
    timestamp: Date.now(),
    expiresAt,
  });
}

export async function getCachedData(key: string): Promise<any | null> {
  const cached = await db.cachedData.where('key').equals(key).first();
  
  if (!cached) return null;
  
  // Vérifier l'expiration
  if (Date.now() > cached.expiresAt) {
    await db.cachedData.delete(cached.id!);
    return null;
  }
  
  return cached.data;
}

export async function clearExpiredCache() {
  const now = Date.now();
  await db.cachedData.where('expiresAt').below(now).delete();
}

export async function clearAllCache() {
  await db.cachedData.clear();
}

export async function clearAllSyncQueue() {
  await db.syncQueue.clear();
}

export async function getSyncStats() {
  const total = await db.syncQueue.count();
  const pending = await db.syncQueue.where('status').equals('pending').count();
  const syncing = await db.syncQueue.where('status').equals('syncing').count();
  const errors = await db.syncQueue.where('status').equals('error').count();
  const success = await db.syncQueue.where('status').equals('success').count();
  
  return {
    total,
    pending,
    syncing,
    errors,
    success,
  };
}
