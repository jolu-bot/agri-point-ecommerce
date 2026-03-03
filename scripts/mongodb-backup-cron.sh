#!/bin/bash
# MongoDB Backup Cron Job Script
# À placer dans scripts/ et l'exécuter via cron ou GitHub Actions

# Configuration
MONGODB_URI="${MONGODB_URI:-mongodb+srv://user:pass@cluster.mongodb.net}"
MONGODB_DB_NAME="${MONGODB_DB_NAME:-agri-ps}"
AZURE_CONNECTION="${AZURE_STORAGE_CONNECTION_STRING}"
AZURE_CONTAINER="${AZURE_BACKUP_CONTAINER:-mongodb-backups}"
BACKUP_DIR="./backups"
LOG_FILE="./logs/mongodb-backup.log"

# Créer répertoire de log s'il n'existe pas
mkdir -p "$(dirname "$LOG_FILE")"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="mongodb_backup_$TIMESTAMP"

echo "[$(date)] Starting MongoDB backup..." >> "$LOG_FILE"

# Créer backup
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
mongodump --uri="$MONGODB_URI" --db="$MONGODB_DB_NAME" --out="$BACKUP_DIR/$BACKUP_NAME" 2>> "$LOG_FILE"

if [ $? -ne 0 ]; then
    echo "[$(date)] ❌ mongodump failed" >> "$LOG_FILE"
    exit 1
fi

# Compresser
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR/$BACKUP_NAME" .

if [ $? -ne 0 ]; then
    echo "[$(date)] ❌ Compression failed" >> "$LOG_FILE"
    exit 1
fi

echo "[$(date)] ✅ Backup compressed: $BACKUP_NAME.tar.gz" >> "$LOG_FILE"

# Upload vers Azure (à utiliser avec Azure CLI: az storage blob upload)
# az storage blob upload \
#   --connection-string "$AZURE_CONNECTION" \
#   --container-name "$AZURE_CONTAINER" \
#   --name "$BACKUP_NAME.tar.gz" \
#   --file "$BACKUP_DIR/$BACKUP_NAME.tar.gz" 2>> "$LOG_FILE"

# Cleanup local
rm -rf "$BACKUP_DIR/$BACKUP_NAME"
rm -f "$BACKUP_DIR/$BACKUP_NAME.tar.gz"

echo "[$(date)] ✅ MongoDB backup completed successfully" >> "$LOG_FILE"
