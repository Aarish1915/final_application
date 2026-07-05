#!/bin/bash
# Ingri World - Automatic EC2 Setup Script (Node.js + Nginx + PM2 + SSL)
# Copy and paste this ENTIRE block into your EC2 Terminal

DOMAIN="ingri-api.duckdns.org"

echo "🚀 Starting EC2 Server Setup for $DOMAIN..."

# 1. Update system and install dependencies
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# 2. Install Node.js 20 & PM2
echo "📦 Installing Node.js & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 3. Setup Project Directory
echo "📁 Preparing project directory..."
mkdir -p /home/ubuntu/ingri-world
cd /home/ubuntu/ingri-world

# 4. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx..."
sudo bash -c "cat > /etc/nginx/sites-available/ingri-backend <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/ingri-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 5. Get SSL Certificate (Automatically)
echo "🔒 Requesting free SSL Certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m aliaarish843@gmail.com

echo "✅ EC2 Setup Complete! Nginx is now routing HTTPS traffic to port 5000."
