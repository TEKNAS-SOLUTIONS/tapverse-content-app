#!/bin/bash

# HTTPS Setup Script for app.tapverse.ai
# Run this script on your server: bash setup-https.sh

set -e

echo "🔒 HTTPS Setup for app.tapverse.ai"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Check domain resolution
echo "📡 Checking DNS configuration..."
if ! nslookup app.tapverse.ai | grep -q "77.42.67.166"; then
    echo "⚠️  Warning: app.tapverse.ai may not be pointing to 77.42.67.166"
    echo "   Please verify DNS A record is set correctly"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo ""
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo ""
    echo "📦 Installing Nginx..."
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
fi

# Install Certbot
echo ""
echo "📦 Installing Certbot..."
apt install certbot python3-certbot-nginx -y

# Check if Nginx config exists
NGINX_CONFIG="/etc/nginx/sites-available/app.tapverse.ai"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo ""
    echo "📝 Creating Nginx configuration..."
    
    # Create Nginx config
    cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    server_name app.tapverse.ai;
    
    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # Enable site
    if [ ! -L "/etc/nginx/sites-enabled/app.tapverse.ai" ]; then
        ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    fi
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    echo "✅ Nginx configuration created"
fi

# Open firewall ports
echo ""
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not found, please manually open ports 80 and 443"
fi

# Obtain SSL certificate
echo ""
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
echo "   This will automatically configure Nginx for HTTPS"
echo ""

# Run certbot
certbot --nginx -d app.tapverse.ai --non-interactive --agree-tos --email admin@tapverse.ai --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    echo "🔍 Testing HTTPS..."
    sleep 2
    
    if curl -s -o /dev/null -w "%{http_code}" https://app.tapverse.ai | grep -q "200\|301\|302"; then
        echo "✅ HTTPS is working!"
    else
        echo "⚠️  HTTPS test returned unexpected result, but certificate was installed"
    fi
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update Google Cloud Console with redirect URI:"
    echo "   https://app.tapverse.ai/connections/google/callback"
    echo ""
    echo "2. Update backend/.env file:"
    echo "   GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback"
    echo "   FRONTEND_URL=https://app.tapverse.ai"
    echo ""
    echo "3. Restart your backend server"
    echo ""
    echo "✅ HTTPS setup complete!"
else
    echo ""
    echo "❌ Failed to obtain SSL certificate"
    echo "   Common issues:"
    echo "   - Domain not pointing to this server"
    echo "   - Port 80 not accessible"
    echo "   - Firewall blocking port 80"
    echo ""
    echo "   Please check:"
    echo "   - DNS: nslookup app.tapverse.ai"
    echo "   - Port 80: telnet app.tapverse.ai 80"
    exit 1
fi
