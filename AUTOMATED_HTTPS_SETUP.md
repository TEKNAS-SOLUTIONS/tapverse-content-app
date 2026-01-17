# Automated HTTPS Setup Instructions

## Quick Setup (3 Steps)

### Step 1: Upload Scripts to Server

```bash
# From your local machine, upload the setup script
scp setup-https.sh root@77.42.67.166:/root/
scp update-oauth-env.sh root@77.42.67.166:/root/tapverse-content-app/
```

### Step 2: Run HTTPS Setup

```bash
# SSH into server
ssh root@77.42.67.166

# Make script executable
chmod +x /root/setup-https.sh

# Run the setup script
bash /root/setup-https.sh
```

The script will:
- ✅ Install Nginx (if not installed)
- ✅ Install Certbot
- ✅ Create Nginx configuration
- ✅ Obtain SSL certificate from Let's Encrypt
- ✅ Configure HTTPS automatically
- ✅ Set up auto-renewal

### Step 3: Update OAuth Configuration

```bash
# Navigate to project directory
cd /root/tapverse-content-app

# Make script executable
chmod +x update-oauth-env.sh

# Run the update script
bash update-oauth-env.sh
```

This will update your `.env` file with:
- Google OAuth credentials
- HTTPS redirect URI
- Frontend URL

### Step 4: Restart Backend

```bash
# Restart backend (adjust based on how you run it)
pm2 restart tapverse-backend
# OR
sudo systemctl restart tapverse-backend
# OR
pkill -f "node src/server" && cd backend && node src/server.js &
```

## Manual Setup (If Scripts Don't Work)

### 1. Install Nginx and Certbot

```bash
ssh root@77.42.67.166
apt update
apt install nginx certbot python3-certbot-nginx -y
```

### 2. Create Nginx Config

```bash
nano /etc/nginx/sites-available/app.tapverse.ai
```

Paste this configuration:

```nginx
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
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/app.tapverse.ai /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 3. Get SSL Certificate

```bash
certbot --nginx -d app.tapverse.ai
```

Follow the prompts:
- Enter email: `admin@tapverse.ai` (or your email)
- Agree to terms: `Y`
- Share email: `N` (optional)
- Redirect HTTP to HTTPS: `2` (recommended)

### 4. Update .env File

```bash
cd /root/tapverse-content-app
nano backend/.env
```

Add/update these lines:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
```

### 5. Restart Backend

```bash
pm2 restart tapverse-backend
# OR your restart method
```

## Verify Setup

### Test HTTPS

```bash
curl -I https://app.tapverse.ai
# Should return 200 OK or 301/302 redirect
```

### Test in Browser

1. Visit: `https://app.tapverse.ai`
2. Should see padlock icon 🔒
3. No security warnings

### Test OAuth

1. Go to: `https://app.tapverse.ai/connections`
2. Click "Connect" for Google service
3. Should redirect to Google OAuth (HTTPS)

## Troubleshooting

### Script fails at DNS check
- Verify DNS: `nslookup app.tapverse.ai`
- Should show: `77.42.67.166`
- Wait for DNS propagation if recently updated

### Certbot fails
- Check port 80 is open: `telnet app.tapverse.ai 80`
- Verify domain points to server
- Check firewall: `ufw status`

### Nginx config errors
- Test config: `nginx -t`
- Check logs: `tail -f /var/log/nginx/error.log`

### HTTPS not working
- Check certificate: `certbot certificates`
- Verify Nginx is running: `systemctl status nginx`
- Check ports: `netstat -tlnp | grep -E '80|443'`

## What the Scripts Do

**setup-https.sh:**
- Installs Nginx and Certbot
- Creates Nginx reverse proxy configuration
- Obtains SSL certificate from Let's Encrypt
- Configures HTTPS automatically
- Sets up auto-renewal

**update-oauth-env.sh:**
- Updates backend/.env with OAuth credentials
- Sets HTTPS redirect URI
- Creates backup of existing .env

## Next Steps After Setup

1. ✅ HTTPS is working
2. ✅ Update Google Cloud Console with redirect URI
3. ✅ Restart backend server
4. ✅ Test OAuth connection

Ready to test! 🚀
