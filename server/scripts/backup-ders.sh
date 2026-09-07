#!/bin/bash
# Ders.ba Weekly Backup Script
# Backs up MongoDB database and uploads folder
# Keeps 3 rolling backups (3 weeks of history)

set -e

# Configuration
BACKUP_DIR="/root/backups/ders"
MAX_BACKUPS=3
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="ders-backup-${DATE}"

# MongoDB connection (reads from environment or uses default)
MONGO_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/ders_production}"
DB_NAME="ders_production"

# Paths
UPLOADS_DIR="/var/www/ders/server/uploads"
LOG_FILE="/var/log/ders-backup.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting Ders.ba backup..."

# Create temporary directory for this backup
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 1. Backup MongoDB
log "Backing up MongoDB database..."
mongodump --uri="$MONGO_URI" --out="$TEMP_DIR/db" 2>> "$LOG_FILE"

# 2. Backup uploads folder
log "Backing up uploads folder..."
cp -r "$UPLOADS_DIR" "$TEMP_DIR/uploads"

# 3. Create compressed archive
log "Creating compressed archive..."
ARCHIVE_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
tar -czf "$ARCHIVE_PATH" -C "$TEMP_DIR" .

# Get archive size
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
log "Backup created: $ARCHIVE_PATH ($ARCHIVE_SIZE)"

# 4. Remove old backups (keep only MAX_BACKUPS)
log "Cleaning old backups (keeping last $MAX_BACKUPS)..."
cd "$BACKUP_DIR"
ls -t ders-backup-*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | while read old_backup; do
    log "Removing old backup: $old_backup"
    rm -f "$old_backup"
done

# 5. List current backups
log "Current backups:"
ls -lh "$BACKUP_DIR"/ders-backup-*.tar.gz 2>/dev/null | tee -a "$LOG_FILE"

log "Backup completed successfully!"
