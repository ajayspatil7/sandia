#!/usr/bin/env python3
"""
Generate synthetic benign shell scripts for training
Creates realistic system administration and deployment scripts
"""

import os
import random

# Template benign scripts
BENIGN_TEMPLATES = [
    # System monitoring
    """#!/bin/bash
# System monitoring script
LOG_DIR="/var/log/monitoring"
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
""",

    # Backup script
    """#!/bin/bash
# Database backup script
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="production_db"

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
""",

    # Package installation
    """#!/bin/bash
# Install development tools
echo "Installing development dependencies..."

# Update package lists
sudo apt-get update -y

# Install build essentials
sudo apt-get install -y build-essential
sudo apt-get install -y git
sudo apt-get install -y curl
sudo apt-get install -y vim

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python tools
sudo apt-get install -y python3 python3-pip

# Verify installations
echo "Verifying installations..."
node --version
npm --version
python3 --version

echo "Installation complete!"
""",

    # Log rotation
    """#!/bin/bash
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
""",

    # Service health check
    """#!/bin/bash
# Service health check script
SERVICES=("nginx" "mysql" "redis" "nodejs")

echo "=== Service Health Check ==="
echo "Checking at: $(date)"

for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✓ $service is running"
    else
        echo "✗ $service is NOT running"
        echo "Attempting to restart $service..."
        sudo systemctl restart $service

        if systemctl is-active --quiet $service; then
            echo "✓ $service restarted successfully"
        else
            echo "✗ Failed to restart $service"
        fi
    fi
done

echo "Health check complete"
""",

    # Deployment script
    """#!/bin/bash
# Application deployment script
APP_DIR="/opt/myapp"
REPO_URL="https://github.com/user/myapp.git"
BRANCH="main"

echo "Starting deployment..."
cd $APP_DIR

# Pull latest code
echo "Pulling latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build application
echo "Building application..."
npm run build

# Restart service
echo "Restarting application service..."
sudo systemctl restart myapp

# Verify
if systemctl is-active --quiet myapp; then
    echo "✓ Deployment successful!"
else
    echo "✗ Deployment failed - service not running"
    exit 1
fi
""",

    # Disk cleanup
    """#!/bin/bash
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
""",

    # User setup
    """#!/bin/bash
# User environment setup
USERNAME="developer"

echo "Setting up environment for $USERNAME..."

# Create directories
mkdir -p ~/projects
mkdir -p ~/bin
mkdir -p ~/logs

# Setup PATH
echo 'export PATH=$PATH:~/bin' >> ~/.bashrc

# Setup Git
git config --global user.name "$USERNAME"
git config --global user.email "${USERNAME}@example.com"
git config --global core.editor "vim"

# Create useful aliases
echo 'alias ll="ls -la"' >> ~/.bashrc
echo 'alias gs="git status"' >> ~/.bashrc
echo 'alias gp="git pull"' >> ~/.bashrc

source ~/.bashrc

echo "Environment setup complete!"
""",

    # Network monitoring
    """#!/bin/bash
# Network connectivity monitor
HOSTS=("8.8.8.8" "google.com" "cloudflare.com")
LOG_FILE="/var/log/network_monitor.log"

echo "=== Network Monitor ===" | tee -a $LOG_FILE
echo "Check time: $(date)" | tee -a $LOG_FILE

for host in "${HOSTS[@]}"; do
    if ping -c 3 $host > /dev/null 2>&1; then
        echo "✓ $host is reachable" | tee -a $LOG_FILE
    else
        echo "✗ $host is NOT reachable" | tee -a $LOG_FILE
    fi
done

# Check port availability
if nc -zv localhost 80 > /dev/null 2>&1; then
    echo "✓ Port 80 is open" | tee -a $LOG_FILE
else
    echo "✗ Port 80 is closed" | tee -a $LOG_FILE
fi

echo "Monitor check complete" | tee -a $LOG_FILE
""",

    # Certificate renewal
    """#!/bin/bash
# SSL certificate renewal script
DOMAIN="example.com"

echo "Checking SSL certificate for $DOMAIN..."

# Check expiry
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate)

echo "Current certificate: $EXPIRY_DATE"

# Renew with Let's Encrypt
echo "Attempting certificate renewal..."
sudo certbot renew --nginx

if [ $? -eq 0 ]; then
    echo "✓ Certificate renewed successfully"
    sudo systemctl reload nginx
else
    echo "✗ Certificate renewal failed"
    exit 1
fi
"""
]

def generate_variations(base_count=26):
    """Generate variations of benign scripts"""
    output_dir = "../datasets/raw/benign"
    os.makedirs(output_dir, exist_ok=True)

    generated = 0
    template_idx = 0

    while generated < base_count:
        # Get base template
        template = BENIGN_TEMPLATES[template_idx % len(BENIGN_TEMPLATES)]

        # Create variations by modifying parameters
        script = template

        # Random variations
        variations = [
            ('LOG_DIR="/var/log/monitoring"', f'LOG_DIR="/var/log/app{random.randint(1,99)}"'),
            ('DB_NAME="production_db"', f'DB_NAME="app_db_{random.randint(1,50)}"'),
            ('SERVICES=("nginx"', f'SERVICES=("apache{random.randint(1,9)}"'),
            ('USERNAME="developer"', f'USERNAME="user{random.randint(100,999)}"'),
            ('/opt/myapp', f'/opt/application{random.randint(1,20)}'),
        ]

        for old, new in variations:
            if old in script:
                script = script.replace(old, new)
                break

        # Save script
        filename = f"benign_{generated + 1:03d}.sh"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, 'w') as f:
            f.write(script)

        print(f"Generated: {filename}")
        generated += 1
        template_idx += 1

    print(f"\n✓ Generated {generated} synthetic benign scripts")
    print(f"Location: {output_dir}/")


if __name__ == '__main__':
    generate_variations(26)
