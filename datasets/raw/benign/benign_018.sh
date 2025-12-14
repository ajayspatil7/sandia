#!/bin/bash
# User environment setup
USERNAME="user837"

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
