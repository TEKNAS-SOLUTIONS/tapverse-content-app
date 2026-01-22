# Quick Deploy to app.tapverse.ai

## After GitHub is Updated

Since your GitHub workspace has been updated, here's how to deploy to the server:

### Step 1: SSH into Server
```bash
ssh root@77.42.67.166
```

### Step 2: Pull and Deploy (Copy-Paste This Entire Block)

```bash
cd /root/tapverse-content-creation && \
git pull origin main && \
cd backend && npm install && npm run db:migrate && \
cd ../frontend && npm install && \
echo "VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE" >> .env && \
npm run build && \
cd .. && \
lsof -ti:5001 | xargs kill -9 2>/dev/null || true && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
sleep 2 && \
cd backend && nohup npm run dev > /tmp/backend.log 2>&1 & \
cd ../frontend && nohup npm run preview > /tmp/frontend.log 2>&1 & \
sleep 5 && \
curl http://localhost:5001/health && \
systemctl reload nginx && \
echo "✅ Deployed! Check: https://app.tapverse.ai"
```

### Step 3: Verify
```bash
curl https://app.tapverse.ai/health
```

## Or Use the Verify Script

After deploying, check status:
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

## What Gets Deployed

✅ All latest code from GitHub
✅ New architecture (error handling, logging, caching)
✅ Left sidebar navigation
✅ Dashboard page
✅ Clients with nested projects
✅ SEO Blog workflow
✅ Programmatic SEO workflow
✅ CMS integration
✅ Export functionality
✅ Google Places API integration
