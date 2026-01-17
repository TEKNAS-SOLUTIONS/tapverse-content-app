# Testing Google OAuth Connection

## Quick Test Steps

### 1. Verify Server Configuration

Make sure your server `.env` file has the updated credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
```

### 2. Restart Backend Server

```bash
# SSH into server
ssh root@77.42.67.166

# Navigate to backend
cd /path/to/tapverse-content-app/backend

# Restart (adjust based on how you run it)
pm2 restart tapverse-backend
# OR
sudo systemctl restart tapverse-backend
# OR
pkill -f "node src/server" && node src/server.js &
```

### 3. Test OAuth Connection

1. **Open the app:**
   - Go to `https://app.tapverse.ai/connections`
   - Or locally: `http://localhost:3000/connections`

2. **Check OAuth Status:**
   - The page should show if OAuth is configured
   - If you see an error, check backend logs

3. **Connect Google Service:**
   - Click "Connect" button for any Google service (e.g., "Google Ads")
   - You should be redirected to Google OAuth consent screen

4. **Authorize:**
   - Sign in with your Google account
   - Review permissions
   - Click "Allow" or "Continue"

5. **Verify Redirect:**
   - You should be redirected back to: `https://app.tapverse.ai/connections/google/callback`
   - Then automatically redirected to `/connections` page
   - You should see the connection listed

### 4. Check for Errors

**If you see "redirect_uri_mismatch":**
- Verify redirect URI in Google Cloud Console matches exactly
- Check for http vs https
- Check for trailing slashes
- Wait a few seconds after updating in Google Cloud Console

**If you see "invalid_client":**
- Verify Client ID and Secret in `.env` are correct
- No extra spaces or quotes
- Restart backend after updating `.env`

**If connection page doesn't load:**
- Check backend is running: `curl http://localhost:5001/health`
- Check frontend is accessible
- Check browser console for errors

**If OAuth page doesn't open:**
- Check backend logs for errors
- Verify `GOOGLE_CLIENT_ID` is set in `.env`
- Check network connectivity

### 5. Verify Connection Created

After successful OAuth:
- Connection should appear in the connections list
- Should show account email
- Should show discovered resources (Google Ads accounts, Search Console properties, etc.)
- Can click "Refresh" to re-discover resources

## Expected Flow

1. Click "Connect Google Ads" → 
2. Redirected to Google OAuth → 
3. Sign in & authorize → 
4. Redirected to `/connections/google/callback` → 
5. Backend processes OAuth → 
6. Redirected to `/connections` → 
7. Connection appears in list ✅

## Troubleshooting Commands

```bash
# Check if backend is running
ps aux | grep "node src/server"

# Check backend logs
pm2 logs tapverse-backend
# OR
tail -f /var/log/tapverse-backend.log

# Test OAuth endpoint
curl -X POST http://localhost:5001/api/connections/google/auth-url \
  -H "Content-Type: application/json" \
  -d '{"connectionType": "google_ads"}'

# Check environment variables
grep GOOGLE backend/.env
```

## Success Indicators

✅ OAuth consent screen appears  
✅ Can sign in with Google account  
✅ Redirected back to app  
✅ Connection appears in connections list  
✅ Can see account email and discovered resources  
✅ No errors in browser console or backend logs  

Good luck with testing! 🚀
