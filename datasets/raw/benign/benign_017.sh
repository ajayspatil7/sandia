#!/bin/bash
# Disk cleanup script
echo "Starting disk cleanup..."

# Clean package manager cache
echo "Cleaning package cache..."
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y

# Clean temp files
echo "Cleaning temporary files..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Clean old logs
echo "Cleaning old logs..."
sudo find /var/log -name "*.log.*" -mtime +30 -delete
sudo find /var/log -name "*.gz" -mtime +30 -delete

# Show disk usage
echo "Current disk usage:"
df -h /

echo "Cleanup complete!"
