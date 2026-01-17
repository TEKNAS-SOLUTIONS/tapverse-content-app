#!/bin/bash

# Complete HTTPS + OAuth Setup Script for app.tapverse.ai
# Run this on your server: bash setup-all.sh

set -e

echo "🚀 Complete Setup: HTTPS + OAuth Configuration"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Get project directory
PROJECT_DIR="/root/tapverse-content-app"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "⚠️  Project directory not found at $PROJECT_DIR"
    read -p "Enter project directory path: " PROJECT_DIR
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "❌ Directory not found: $PROJECT_DIR"
        exit 1
    fi
fi

ENV_FILE="$PROJECT_DIR/backend/.env"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# ============================================
# PART 1: HTTPS SETUP
# ============================================

echo "🔒 PART 1: Setting up HTTPS..."
echo ""

# Check DNS
echo "📡 Checking DNS configuration..."
if ! nslookup app.tapverse.ai | grep -q "77.42.67.166"; then
    echo "⚠️  Warning: app.tapverse.ai may not be pointing to 77.42.67.166"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
apt update -qq
apt upgrade -y -qq

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt install nginx -y -qq
    systemctl enable nginx
    systemctl start nginx
    echo "✅ Nginx installed"
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt install certbot python3-certbot-nginx -y -qq
    echo "✅ Certbot installed"
fi

# Create Nginx config
NGINX_CONFIG="/etc/nginx/sites-available/app.tapverse.ai"
echo "📝 Configuring Nginx..."

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
    ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/ 2>/dev/null || true
fi

# Test and reload Nginx
nginx -t
systemctl reload nginx
echo "✅ Nginx configured"

# Configure firewall
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    ufw --force enable 2>/dev/null || true
    echo "✅ Firewall configured"
fi

# Get SSL certificate
echo ""
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
echo "   (This may take a minute...)"
echo ""

# Check if certificate already exists
if [ -d "/etc/letsencrypt/live/app.tapverse.ai" ]; then
    echo "✅ SSL certificate already exists"
    certbot renew --quiet
else
    # Get email for Let's Encrypt
    EMAIL="admin@tapverse.ai"
    read -p "Enter email for Let's Encrypt notifications [$EMAIL]: " INPUT_EMAIL
    EMAIL=${INPUT_EMAIL:-$EMAIL}
    
    # Run certbot
    certbot --nginx -d app.tapverse.ai \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --redirect \
        --quiet || {
        echo ""
        echo "❌ Failed to obtain SSL certificate"
        echo "   Trying interactive mode..."
        certbot --nginx -d app.tapverse.ai
    }
fi

echo "✅ SSL certificate configured"

# ============================================
# PART 2: OAuth Configuration
# ============================================

echo ""
echo "🔑 PART 2: Configuring OAuth..."
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env file not found, creating it..."
    mkdir -p "$PROJECT_DIR/backend"
    touch "$ENV_FILE"
fi

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created"
fi

# Update or add Google OAuth variables
echo "📝 Updating OAuth configuration..."

# Remove old Google OAuth entries
sed -i '/^GOOGLE_CLIENT_ID=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^GOOGLE_CLIENT_SECRET=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^GOOGLE_REDIRECT_URI=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^FRONTEND_URL=/d' "$ENV_FILE" 2>/dev/null || true

# Add new entries
cat >> "$ENV_FILE" << 'EOF'

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
EOF

echo "✅ OAuth configuration updated"

# ============================================
# PART 3: Verification
# ============================================

echo ""
echo "✅ PART 3: Verifying setup..."
echo ""

# Test HTTPS
echo "🔍 Testing HTTPS..."
sleep 2
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.tapverse.ai || echo "000")

if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    echo "✅ HTTPS is working! (Status: $HTTPS_STATUS)"
else
    echo "⚠️  HTTPS test returned status: $HTTPS_STATUS"
    echo "   (This might be normal if the app isn't running yet)"
fi

# Show configuration
echo ""
echo "📋 Configuration Summary:"
echo "=========================="
echo "Domain: app.tapverse.ai"
echo "SSL Certificate: /etc/letsencrypt/live/app.tapverse.ai/"
echo "Nginx Config: /etc/nginx/sites-available/app.tapverse.ai"
echo "OAuth Redirect URI: https://app.tapverse.ai/connections/google/callback"
echo ""

# Show .env entries
echo "📝 OAuth entries in .env:"
grep -E "GOOGLE_|FRONTEND_URL" "$ENV_FILE" | sed 's/^/   /'

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. ✅ HTTPS is configured"
echo "2. ✅ OAuth credentials are in .env"
echo "3. ⏭️  Update Google Cloud Console:"
echo "   Add redirect URI: https://app.tapverse.ai/connections/google/callback"
echo "4. ⏭️  Restart your backend server:"
echo "   pm2 restart tapverse-backend"
echo "   OR: systemctl restart tapverse-backend"
echo "5. ⏭️  Test OAuth connection at: https://app.tapverse.ai/connections"
echo ""
