#!/bin/bash
# Ingri World EC2 Setup Script
# Run this on a fresh Ubuntu 22.04+ EC2 instance

set -e

echo "🚀 Starting EC2 Setup for Ingri Backend..."

# 1. Update and install dependencies
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git unzip

# 2. Install Docker & Docker Compose
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose
    
    # Add ubuntu user to docker group
    sudo usermod -aG docker ubuntu
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker already installed."
fi

# 3. Setup Project Directory
echo "📁 Setting up project directory..."
sudo mkdir -p /opt/ingri-backend
sudo chown -R ubuntu:ubuntu /opt/ingri-backend

# 4. Generate SSH Key for GitHub Deployment
echo "🔑 Generating SSH Key for GitHub..."
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -C "deploy@ingri.world" -f ~/.ssh/id_rsa -N ""
    echo "=========================================================="
    echo "⚠️ ADD THIS PUBLIC KEY TO GITHUB DEPLOY KEYS:"
    cat ~/.ssh/id_rsa.pub
    echo "=========================================================="
fi

echo "✅ EC2 Setup Complete! You can now clone your repository to /opt/ingri-backend and start the containers."
