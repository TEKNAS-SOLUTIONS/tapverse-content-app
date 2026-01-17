# HTTPS Setup Guide for app.tapverse.ai

## Option 1: Using Let's Encrypt (Free SSL - Recommended)

### Prerequisites
- Domain `app.tapverse.ai` pointing to `77.42.67.166`
- SSH access to server
- Port 80 and 443 open in firewall

### Step 1: Install Certbot

```bash
# SSH into server
ssh root@77.42.67.166

# Update system
apt update && apt upgrade -y

# Install certbot
apt install certbot python3-certbot-nginx -y
# OR if using Apache:
# apt install certbot python3-certbot-apache -y
```

### Step 2: Obtain SSL Certificate

**If using Nginx:**
```bash
# Certbot will automatically configure Nginx
certbot --nginx -d app.tapverse.ai
```

**If using Apache:**
```bash
# Certbot will automatically configure Apache
certbot --apache -d app.tapverse.ai
```

**If not using a web server (standalone):**
```bash
# Stop your application temporarily
# Certbot will use port 80
certbot certonly --standalone -d app.tapverse.ai
```

### Step 3: Auto-Renewal Setup

```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically sets up renewal via cron
# Certificates renew automatically every 90 days
```

### Step 4: Configure Nginx (if using)

Create/edit `/etc/nginx/sites-available/app.tapverse.ai`:

```nginx
server {
    listen 80;
    server_name app.tapverse.ai;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.tapverse.ai;

    ssl_certificate /etc/letsencrypt/live/app.tapverse.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.tapverse.ai/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/app.tapverse.ai /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

## Option 2: Using Cloudflare (Free SSL - Easiest)

### Step 1: Add Domain to Cloudflare

1. Sign up at [Cloudflare](https://www.cloudflare.com/)
2. Add domain `tapverse.ai`
3. Update nameservers at your domain registrar
4. Add DNS A record: `app` → `77.42.67.166`

### Step 2: Enable SSL

1. Go to Cloudflare Dashboard → SSL/TLS
2. Set encryption mode to **"Full"** or **"Full (strict)"**
3. SSL automatically enabled - no server configuration needed!

### Step 3: Configure Server

Your server can still use HTTP internally, Cloudflare handles HTTPS:

```nginx
# Nginx config (simpler with Cloudflare)
server {
    listen 80;
    server_name app.tapverse.ai;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }
}
```

## Option 3: Using Node.js with HTTPS (Direct)

If running Node.js directly without Nginx:

```javascript
// backend/src/server.js (add HTTPS support)
import https from 'https';
import fs from 'fs';

// After getting SSL certificate
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/app.tapverse.ai/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/app.tapverse.ai/fullchain.pem')
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// Also run HTTP server to redirect to HTTPS
app.listen(80, () => {
  console.log('HTTP server running on port 80 (redirecting to HTTPS)');
});
```

## Verify HTTPS is Working

```bash
# Test SSL certificate
curl -I https://app.tapverse.ai

# Check certificate details
openssl s_client -connect app.tapverse.ai:443 -servername app.tapverse.ai

# Test from browser
# Visit: https://app.tapverse.ai
# Should show padlock icon
```

## Firewall Configuration

Make sure ports are open:

```bash
# UFW (Ubuntu)
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

# Or iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Troubleshooting

### Certificate not working
- Verify DNS: `nslookup app.tapverse.ai` should show `77.42.67.166`
- Check port 80 is accessible: `telnet app.tapverse.ai 80`
- Verify certbot ran successfully: `certbot certificates`

### Mixed content errors
- Make sure all resources use HTTPS
- Check browser console for HTTP resources
- Update any hardcoded HTTP URLs

### Redirect loop
- Check Nginx config for redirect rules
- Verify backend is running on correct port
- Check firewall isn't blocking ports

## Recommended: Let's Encrypt + Nginx

This is the most common and reliable setup:
1. Install Nginx
2. Install Certbot
3. Run `certbot --nginx -d app.tapverse.ai`
4. Done! ✅

SSL certificate auto-renews every 90 days.
