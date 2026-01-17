# Quick Setup - Copy & Paste These Commands

## Step 1: SSH into Server

```bash
ssh root@77.42.67.166
```

## Step 2: Copy & Paste This Entire Block

Copy everything from `# === START ===` to `# === END ===` and paste into your server terminal:

```bash
# === START ===
cd /root

# Create the complete setup script
cat > setup-all.sh << 'SCRIPT_END'
#!/bin/bash
set -e
echo "🚀 Complete Setup: HTTPS + OAuth Configuration"
echo "================================================"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

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
echo "🔒 PART 1: Setting up HTTPS..."

echo "📡 Checking DNS..."
if ! nslookup app.tapverse.ai | grep -q "77.42.67.166"; then
    echo "⚠️  Warning: DNS check failed, continuing anyway..."
fi

echo "📦 Updating system..."
apt update -qq && apt upgrade -y -qq

if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt install nginx -y -qq
    systemctl enable nginx
    systemctl start nginx
fi

if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt install certbot python3-certbot-nginx -y -qq
fi

echo "📝 Configuring Nginx..."
cat > /etc/nginx/sites-available/app.tapverse.ai << 'NGINX_END'
server {
    listen 80;
    server_name app.tapverse.ai;
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
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_END

ln -sf /etc/nginx/sites-available/app.tapverse.ai /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

if command -v ufw &> /dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
fi

echo "🔐 Obtaining SSL certificate..."
if [ ! -d "/etc/letsencrypt/live/app.tapverse.ai" ]; then
    certbot --nginx -d app.tapverse.ai --non-interactive --agree-tos --email admin@tapverse.ai --redirect || certbot --nginx -d app.tapverse.ai
else
    certbot renew --quiet
fi

echo ""
echo "🔑 PART 2: Configuring OAuth..."

if [ ! -f "$ENV_FILE" ]; then
    mkdir -p "$PROJECT_DIR/backend"
    touch "$ENV_FILE"
fi

cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true

sed -i '/^GOOGLE_CLIENT_ID=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^GOOGLE_CLIENT_SECRET=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^GOOGLE_REDIRECT_URI=/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/^FRONTEND_URL=/d' "$ENV_FILE" 2>/dev/null || true

cat >> "$ENV_FILE" << 'ENV_END'

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
ENV_END

echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update Google Cloud Console with redirect URI:"
echo "   https://app.tapverse.ai/connections/google/callback"
echo "2. Restart backend: pm2 restart tapverse-backend"
echo "3. Test: https://app.tapverse.ai/connections"
SCRIPT_END

chmod +x setup-all.sh
bash setup-all.sh
# === END ===
```

## That's It!

The script will:
- ✅ Set up HTTPS with Let's Encrypt
- ✅ Configure Nginx reverse proxy
- ✅ Update OAuth credentials in .env
- ✅ Show you next steps

## After Script Completes

1. **Update Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click your OAuth Client ID
   - Add redirect URI: `https://app.tapverse.ai/connections/google/callback`
   - Save

2. **Restart Backend:**
   ```bash
   pm2 restart tapverse-backend
   # OR
   systemctl restart tapverse-backend
   ```

3. **Test:**
   - Visit: https://app.tapverse.ai/connections
   - Try connecting a Google service

Done! 🎉
