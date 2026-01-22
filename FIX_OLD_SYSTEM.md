# Fix: Old System Still Showing

## Problem
The live site at app.tapverse.ai is still showing the OLD system instead of the NEW one we built.

## Root Cause
The frontend wasn't rebuilt with the new code, so the old build is still being served.

## Solution: Deploy New System

### Step 1: SSH into Server
```bash
ssh root@77.42.67.166
```

### Step 2: Run This Complete Script

Copy-paste this ENTIRE block:

```bash
cd /root/tapverse-content-creation && \
git pull origin main && \
cd backend && npm install && npm run db:migrate && \
cd ../frontend && npm install && \
echo "VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE" >> .env && \
rm -rf dist/ node_modules/.vite && \
npm run build && \
cd .. && \
pkill -f "node.*server" || true && \
pkill -f "vite" || true && \
lsof -ti:5001 | xargs kill -9 2>/dev/null || true && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
lsof -ti:5173 | xargs kill -9 2>/dev/null || true && \
sleep 3 && \
cd backend && nohup npm run dev > /tmp/backend.log 2>&1 & \
sleep 3 && \
cd ../frontend && nohup npm run preview -- --port 3001 --host 0.0.0.0 > /tmp/frontend.log 2>&1 & \
sleep 5 && \
sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://localhost:3001|g' /etc/nginx/sites-available/app.tapverse.ai && \
nginx -t && systemctl reload nginx && \
curl http://localhost:5001/health && \
echo "✅ NEW SYSTEM DEPLOYED! Clear browser cache (Ctrl+Shift+R)"
```

### Step 3: Clear Browser Cache
**CRITICAL:** After deployment, you MUST clear your browser cache:
- **Chrome/Edge:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Firefox:** Ctrl+F5 or Cmd+Shift+R
- Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## What This Does

1. ✅ Pulls latest code from GitHub
2. ✅ Installs all dependencies
3. ✅ **DELETES old build** (critical!)
4. ✅ **Builds NEW frontend** with new code
5. ✅ Stops all old services
6. ✅ Starts backend on port 5001
7. ✅ Starts frontend on port 3001 (serving NEW build)
8. ✅ Updates nginx to point to port 3001
9. ✅ Reloads nginx

## Verify New System is Running

After deployment, check:

```bash
# Check if new build exists
ls -la /root/tapverse-content-creation/frontend/dist/

# Check if services are running
ps aux | grep node

# Test endpoints
curl http://localhost:3001
curl http://localhost:5001/health
```

## What You Should See After Fix

✅ **Left sidebar** (not top navigation)
✅ **Dashboard** with stats cards
✅ **Clients as cards** (not table rows)
✅ **Projects nested** under clients
✅ **Content type cards** in project detail
✅ **New workflows** (SEO Blog, Programmatic SEO)

## If Still Seeing Old System

1. **Verify new build exists:**
   ```bash
   ls -la /root/tapverse-content-creation/frontend/dist/
   ```

2. **Check what's being served:**
   ```bash
   curl http://localhost:3001 | head -20
   ```

3. **Check nginx config:**
   ```bash
   cat /etc/nginx/sites-available/app.tapverse.ai | grep proxy_pass
   ```
   Should show: `proxy_pass http://localhost:3001;`

4. **Clear ALL browser cache** and try incognito/private window

5. **Check frontend logs:**
   ```bash
   tail -50 /tmp/frontend.log
   ```
