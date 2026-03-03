/// <reference types="../types/modules" />
import { exec } from 'child_process';
import { promisify } from 'util';
import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface BackupConfig {
  mongoUri: string;
  mongoDBName: string;
  azureStorageConnection: string;
  azureContainer: string;
  retentionDays: number;
}

/**
 * Effectue un backup MongoDB automatique
 */
export async function backupMongoDB(config: BackupConfig): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', `mongodb-${timestamp}`);

  try {
    // 1. Créer le répertoire de backup
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 2. Exécuter mongodump
    console.log(`📦 Starting MongoDB backup to ${backupDir}...`);
    const dumpCmd = `mongodump --uri="${config.mongoUri}" --db="${config.mongoDBName}" --out="${backupDir}"`;
    await execAsync(dumpCmd);
    console.log('✅ mongodump completed');

    // 3. Compresser le backup
    console.log('🗜️ Compressing backup...');
    const tarFile = `${backupDir}.tar.gz`;
    await execAsync(`tar -czf "${tarFile}" -C "${backupDir}" .`);
    console.log(`✅ Compressed: ${tarFile}`);

    // 4. Uploader vers Azure Blob Storage
    console.log('☁️ Uploading to Azure Storage...');
    await uploadToAzure(config, tarFile);
    console.log('✅ Uploaded to Azure');

    // 5. Nettoyer les fichiers locaux
    fs.rmSync(backupDir, { recursive: true, force: true });
    fs.unlinkSync(tarFile);

    console.log(`🎉 Backup completed: ${tarFile}`);
    return tarFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

/**
 * Upload backup to Azure Blob Storage
 */
async function uploadToAzure(config: BackupConfig, filePath: string): Promise<void> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      config.azureStorageConnection
    );
    const containerClient = blobServiceClient.getContainerClient(config.azureContainer);
    const blobName = `mongodb-backups/${path.basename(filePath)}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload avec retry
    await blockBlobClient.uploadFile(filePath, {
      overwrite: true,
      tags: {
        backup_date: new Date().toISOString(),
        db: config.mongoDBName,
      },
    });

    console.log(`✅ Uploaded to Azure: ${blobName}`);
  } catch (error) {
    console.error('Azure upload failed:', error);
    throw error;
  }
}

/**
 * Restore MongoDB from backup
 */
export async function restoreMongoDB(config: BackupConfig, backupFile: string): Promise<void> {
  const restoreDir = path.join(process.cwd(), 'restore', `restore-${Date.now()}`);

  try {
    console.log(`📂 Extracting backup...`);
    fs.mkdirSync(restoreDir, { recursive: true });

    // Extraire
    await execAsync(`tar -xzf "${backupFile}" -C "${restoreDir}"`);

    // Restore
    console.log(`⏳ Restoring MongoDB...`);
    const restoreCmd = `mongorestore --uri="${config.mongoUri}" --dir="${restoreDir}"`;
    await execAsync(restoreCmd);

    console.log(`✅ Restore completed`);
    fs.rmSync(restoreDir, { recursive: true, force: true });
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

/**
 * Schedule automatic backups (pour être appelé par cron)
 */
export async function scheduleBackup(config: BackupConfig) {
  try {
    await backupMongoDB(config);

    // Optionnel: Nettoyage des anciens backups
    // await cleanOldBackups(config);
  } catch (error) {
    console.error('Scheduled backup failed:', error);
    // Envoyer alerte (Slack, email, etc.)
  }
}
