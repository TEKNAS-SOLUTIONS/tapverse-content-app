# Production Environment Setup - app.tapverse.ai

## Google OAuth Configuration

### Step 1: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/connections/google/callback` (for local dev)
   - `https://app.tapverse.ai/connections/google/callback` (for production)
4. Click "SAVE"

### Step 2: Update Server .env File

On your production server (`77.42.67.166`), update the `.env` file in the `backend` directory:

```env
# Google OAuth Credentials (HTTPS)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
```

**⚠️ Make sure HTTPS is set up first!** See `HTTPS_SETUP_GUIDE.md` for SSL certificate setup instructions.

### Step 3: Verify DNS Configuration

Make sure your DNS is configured correctly:

```bash
# Check if domain resolves to your server
ping app.tapverse.ai
# Should show: 77.42.67.166

# Or check DNS record
nslookup app.tapverse.ai
# Should show A record pointing to 77.42.67.166
```

### Step 4: Restart Backend Server

After updating `.env`:

```bash
# SSH into server
ssh root@77.42.67.166

# Navigate to backend directory
cd /path/to/tapverse-content-app/backend

# Restart the server (method depends on how you're running it)
# If using PM2:
pm2 restart tapverse-backend

# If using systemd:
sudo systemctl restart tapverse-backend

# If running directly:
pkill -f "node src/server"
node src/server.js &
```

### Step 5: Test Connection

1. Go to `https://app.tapverse.ai/connections`
2. Click "Connect" for any Google service
3. You should be redirected to Google OAuth consent screen
4. After authorization, you should be redirected back to the app

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the redirect URI in `.env` matches exactly what's in Google Cloud Console
- Check for trailing slashes, http vs https
- Make sure DNS is resolving correctly: `ping app.tapverse.ai`

### Domain Not Resolving
- Check DNS A record: `app.tapverse.ai` → `77.42.67.166`
- Wait for DNS propagation (can take up to 24 hours, usually 5-30 minutes)
- Use `nslookup app.tapverse.ai` to verify

### HTTPS Not Working
- If using HTTPS, make sure SSL certificate is configured
- Use Let's Encrypt or Cloudflare for free SSL
- If HTTPS not available yet, use HTTP temporarily (not recommended for production)

## Summary

**Your Configuration:**
- Domain: `app.tapverse.ai`
- Server IP: `77.42.67.166`
- Redirect URI: `https://app.tapverse.ai/connections/google/callback`
- Client ID: `your-client-id.apps.googleusercontent.com`

**Next Steps:**
1. ✅ Add redirect URI to Google Cloud Console
2. ✅ Update `.env` file on server
3. ✅ Restart backend server
4. ✅ Test OAuth connection
