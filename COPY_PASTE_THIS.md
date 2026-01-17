# Copy & Paste This on Your Server

## Single Command to Run Everything

SSH into your server, then copy and paste this **entire block**:

```bash
ssh root@77.42.67.166
```

Then paste this:

```bash
cd /root && cat > setup-all.sh << 'EOFSCRIPT'
#!/bin/bash
set -e
echo "🚀 Complete Setup: HTTPS + OAuth Configuration"
PROJECT_DIR="/root/tapverse-content-app"
[ ! -d "$PROJECT_DIR" ] && read -p "Enter project directory: " PROJECT_DIR
ENV_FILE="$PROJECT_DIR/backend/.env"
echo "📁 Project: $PROJECT_DIR"
echo "🔒 Setting up HTTPS..."
apt update -qq && apt upgrade -y -qq
command -v nginx || (apt install nginx -y -qq && systemctl enable nginx && systemctl start nginx)
command -v certbot || apt install certbot python3-certbot-nginx -y -qq
cat > /etc/nginx/sites-available/app.tapverse.ai << 'NGINX'
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
NGINX
ln -sf /etc/nginx/sites-available/app.tapverse.ai /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
ufw allow 80/tcp 2>/dev/null; ufw allow 443/tcp 2>/dev/null
[ ! -d "/etc/letsencrypt/live/app.tapverse.ai" ] && certbot --nginx -d app.tapverse.ai --non-interactive --agree-tos --email admin@tapverse.ai --redirect || certbot renew --quiet
echo "🔑 Configuring OAuth..."
[ ! -f "$ENV_FILE" ] && mkdir -p "$PROJECT_DIR/backend" && touch "$ENV_FILE"
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null
sed -i '/^GOOGLE_CLIENT_ID=/d; /^GOOGLE_CLIENT_SECRET=/d; /^GOOGLE_REDIRECT_URI=/d; /^FRONTEND_URL=/d' "$ENV_FILE" 2>/dev/null
cat >> "$ENV_FILE" << 'ENV'
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
ENV
echo "✅ Setup Complete!"
echo "📋 Next: 1) Update Google Cloud Console with redirect URI"
echo "        2) Restart backend: pm2 restart tapverse-backend"
echo "        3) Test: https://app.tapverse.ai/connections"
EOFSCRIPT
chmod +x setup-all.sh && bash setup-all.sh
```

## What This Does

1. ✅ Creates the setup script on your server
2. ✅ Runs it automatically
3. ✅ Sets up HTTPS with Let's Encrypt
4. ✅ Configures Nginx
5. ✅ Updates OAuth credentials in .env

## After It Completes

1. **Update Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Add redirect URI: `https://app.tapverse.ai/connections/google/callback`

2. **Restart Backend:**
   ```bash
   pm2 restart tapverse-backend
   # OR
   systemctl restart tapverse-backend
   ```

3. **Test:**
   - Visit: https://app.tapverse.ai/connections
   - Try connecting a Google service

That's it! 🚀
