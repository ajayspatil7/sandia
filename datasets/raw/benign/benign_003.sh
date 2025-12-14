#!/bin/bash
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
