#!/bin/bash  
# Backup script
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$(date +%Y%m%d).tar.gz /home/user/data
echo "Backup complete"
