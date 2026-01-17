# Run Setup on Server - Quick Instructions

## Single Command Setup

SSH into your server and run:

```bash
ssh root@77.42.67.166

# Download and run the setup script
cd /root
curl -o setup-all.sh https://raw.githubusercontent.com/YOUR_REPO/tapverse-content-app/main/setup-all.sh
# OR if you have the file locally, upload it first:
# scp setup-all.sh root@77.42.67.166:/root/

# Make executable and run
chmod +x setup-all.sh
bash setup-all.sh
```

## Or Copy-Paste This Entire Script

If you prefer, you can copy the entire script content and paste it directly:

```bash
ssh root@77.42.67.166

# Create the script
cat > /root/setup-all.sh << 'SCRIPT_END'
[paste the entire setup-all.sh content here]
SCRIPT_END

# Run it
chmod +x /root/setup-all.sh
bash /root/setup-all.sh
```

## What It Does

1. ✅ Installs Nginx (if needed)
2. ✅ Installs Certbot
3. ✅ Creates Nginx reverse proxy config
4. ✅ Obtains SSL certificate from Let's Encrypt
5. ✅ Configures HTTPS automatically
6. ✅ Updates backend/.env with OAuth credentials
7. ✅ Sets up HTTPS redirect URI
8. ✅ Verifies everything works

## After Running

1. The script will show you what to do next
2. Update Google Cloud Console with the redirect URI
3. Restart your backend server
4. Test OAuth connection

## Manual Steps After Script

### 1. Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

Click your OAuth Client ID, then add:
```
https://app.tapverse.ai/connections/google/callback
```

### 2. Restart Backend

```bash
# Find how your backend is running
ps aux | grep "node.*server"

# Restart accordingly
pm2 restart tapverse-backend
# OR
systemctl restart tapverse-backend
# OR
cd /root/tapverse-content-app/backend && node src/server.js &
```

### 3. Test

Visit: https://app.tapverse.ai/connections

Try connecting a Google service!
