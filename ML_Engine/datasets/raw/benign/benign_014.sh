#!/bin/bash
# Log rotation
LOG_DIR="/var/log/app"
find $LOG_DIR -name "*.log" -mtime +7 -delete
echo "Old logs cleaned"
