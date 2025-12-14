#!/bin/bash
# Log rotation script
LOG_DIR="/var/log/application"
ARCHIVE_DIR="/var/log/application/archive"

mkdir -p $ARCHIVE_DIR

# Rotate logs older than 24 hours
find $LOG_DIR -name "*.log" -mtime +1 -type f | while read logfile; do
    filename=$(basename "$logfile")
    gzip "$logfile"
    mv "${logfile}.gz" "$ARCHIVE_DIR/"
    echo "Archived: $filename"
done

# Delete archives older than 30 days
find $ARCHIVE_DIR -name "*.log.gz" -mtime +30 -delete

echo "Log rotation complete"
