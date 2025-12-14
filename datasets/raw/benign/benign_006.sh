#!/bin/bash
# Application deployment script
APP_DIR="/opt/application2"
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
