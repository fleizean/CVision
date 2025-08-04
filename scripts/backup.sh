#!/bin/bash

# CVision Database Backup Script
# This script creates backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="${POSTGRES_DB:-cvisiondb}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cvision_backup_${DATE}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

print_status "Starting database backup..."
print_status "Database: $DB_NAME"
print_status "Backup file: $BACKUP_FILE"

# Create database backup
if pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$BACKUP_DIR/$BACKUP_FILE"; then
    print_success "Database backup created successfully"
    
    # Compress the backup
    if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
        print_success "Backup compressed: ${BACKUP_FILE}.gz"
        BACKUP_FILE="${BACKUP_FILE}.gz"
    else
        print_warning "Failed to compress backup, keeping uncompressed version"
    fi
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    print_status "Backup size: $BACKUP_SIZE"
    
else
    print_error "Database backup failed"
    exit 1
fi

# Clean up old backups
print_status "Cleaning up old backups (older than $BACKUP_RETENTION_DAYS days)..."
find $BACKUP_DIR -name "cvision_backup_*.sql*" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

REMAINING_BACKUPS=$(ls -1 $BACKUP_DIR/cvision_backup_*.sql* 2>/dev/null | wc -l)
print_success "Cleanup completed. Remaining backups: $REMAINING_BACKUPS"

# Create a latest backup symlink
ln -sf "$BACKUP_FILE" "$BACKUP_DIR/latest_backup.sql.gz"
print_status "Created symlink: latest_backup.sql.gz -> $BACKUP_FILE"

print_success "Backup process completed successfully!"

# Optional: Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ]; then
    print_status "Uploading backup to S3..."
    if aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$AWS_S3_BUCKET/cvision-backups/"; then
        print_success "Backup uploaded to S3 successfully"
    else
        print_error "Failed to upload backup to S3"
    fi
fi

# Optional: Send notification
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"CVision database backup completed successfully. Size: $BACKUP_SIZE\"}" \
        >/dev/null 2>&1 || true
fi

print_status "Backup script finished at $(date)"