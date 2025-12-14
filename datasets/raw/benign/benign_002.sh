#!/bin/bash
# Database backup script
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="app_db_44"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."
echo "Backup started at: $(date)"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/${DB_NAME}_${DATE}.sql

if [ $? -eq 0 ]; then
    echo "Backup successful: ${DB_NAME}_${DATE}.sql"
    gzip $BACKUP_DIR/${DB_NAME}_${DATE}.sql
    echo "Backup compressed"

    # Remove backups older than 7 days
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi

echo "Backup completed at: $(date)"
