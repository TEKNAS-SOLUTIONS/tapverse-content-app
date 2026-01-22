# Check Live Deployment Status

## Current Status
✅ Code has been deployed to app.tapverse.ai from a different machine

## Quick Verification

### 1. Check if Site is Live
Visit: https://app.tapverse.ai/

### 2. Check Backend Health
```bash
curl https://app.tapverse.ai/health
# or
curl https://app.tapverse.ai/api/health
```

### 3. Check if Services are Running (SSH into server)
```bash
ssh root@77.42.67.166
ps aux | grep node
netstat -tlnp | grep -E '5001|3001'
```

### 4. Check Logs
```bash
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
tail -f /var/log/nginx/error.log
```

## Common Issues After Deployment

### Issue 1: Site Shows Blank/Empty
**Possible causes:**
- Frontend not built or not serving correctly
- Nginx not configured properly
- Services not running

**Fix:**
```bash
cd /root/tapverse-content-creation/frontend
npm run build
# Verify dist/ folder exists
ls -la dist/
```

### Issue 2: API Not Working
**Check:**
```bash
curl http://localhost:5001/health
# If fails, restart backend
cd /root/tapverse-content-creation/backend
npm run dev
```

### Issue 3: Google Places API Not Working
**Check:**
```bash
# Verify API key is in .env
cat /root/tapverse-content-creation/frontend/.env | grep GOOGLE_PLACES
```

### Issue 4: Database Migration Not Run
**Fix:**
```bash
cd /root/tapverse-content-creation/backend
npm run db:migrate
```

## Verify New Features

### 1. Left Sidebar Navigation
- Should see: Home, Clients, Settings
- Logo at top

### 2. Dashboard Page
- Visit: https://app.tapverse.ai/
- Should show dashboard with stats and quick actions

### 3. Clients Page
- Visit: https://app.tapverse.ai/clients
- Should show card-based client list

### 4. Projects Nested Under Clients
- Click on a client
- Should see projects listed as cards

### 5. Content Type Cards
- Go to a project
- Should see horizontal content type cards (SEO Blog, Programmatic SEO)

## Test Workflows

### SEO Blog Workflow
1. Go to a project
2. Click "SEO Blog Content" card
3. Should see 6-step workflow:
   - Keyword Analysis
   - Keyword Gaps
   - Keyword Selection
   - Content Ideas
   - Generate Content
   - Content Display

### Programmatic SEO Workflow
1. Go to a project
2. Click "Programmatic SEO" card
3. Should see 5-step workflow:
   - Select Suburbs
   - Manage Services
   - Select Combinations
   - Batch Generate
   - Content Display

## If Something Doesn't Work

1. **Check browser console** (F12) for errors
2. **Check network tab** for failed API calls
3. **Check server logs** (see above)
4. **Verify environment variables** are set
5. **Restart services** if needed

## Restart Services (if needed)

```bash
# Stop services
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start backend
cd /root/tapverse-content-creation/backend
nohup npm run dev > /tmp/backend.log 2>&1 &

# Start frontend
cd /root/tapverse-content-creation/frontend
nohup npm run preview > /tmp/frontend.log 2>&1 &

# Reload nginx
systemctl reload nginx
```
