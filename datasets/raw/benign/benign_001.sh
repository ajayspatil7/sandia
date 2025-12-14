#!/bin/bash
# System monitoring script
LOG_DIR="/var/log/app16"
mkdir -p $LOG_DIR

echo "=== System Status Report ===" > $LOG_DIR/status_$(date +%Y%m%d).log
echo "Date: $(date)" >> $LOG_DIR/status_$(date +%Y%m%d).log
echo "" >> $LOG_DIR/status_$(date +%Y%m%d).log

echo "CPU Usage:" >> $LOG_DIR/status_$(date +%Y%m%d).log
top -bn1 | head -5 >> $LOG_DIR/status_$(date +%Y%m%d).log

echo "" >> $LOG_DIR/status_$(date +%Y%m%d).log
echo "Memory Usage:" >> $LOG_DIR/status_$(date +%Y%m%d).log
free -h >> $LOG_DIR/status_$(date +%Y%m%d).log

echo "" >> $LOG_DIR/status_$(date +%Y%m%d).log
echo "Disk Usage:" >> $LOG_DIR/status_$(date +%Y%m%d).log
df -h >> $LOG_DIR/status_$(date +%Y%m%d).log

echo "Status report saved to $LOG_DIR"
