#!/bin/bash
# Package update
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get autoremove -y
echo "System updated"
