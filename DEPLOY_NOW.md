# Quick Deployment Guide

## Code Status
✅ **Code pushed to GitHub successfully!**

## Deploy to Server

### Option 1: SSH and Run Deploy Script (Recommended)

```bash
# SSH into server
ssh root@77.42.67.166

# Navigate to project
cd /root/tapverse-content-creation

# Pull latest code
git pull origin main

# Install new dependencies (if any)
cd backend && npm install
cd ../frontend && npm install

# Run deployment script
chmod +x deploy.sh
./deploy.sh all
```

### Option 2: One-Line Remote Execution

From your local machine:

```bash
ssh root@77.42.67.166 "cd /root/tapverse-content-creation && git pull origin main && cd backend && npm install && cd ../frontend && npm install && chmod +x deploy.sh && ./deploy.sh all"
```

### Option 3: Manual Step-by-Step

```bash
# SSH into server
ssh root@77.42.67.166

# Pull code
cd /root/tapverse-content-creation
git pull origin main

# Backend
cd backend
npm install
npm run db:migrate  # Run new migration for approved_content table
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
nohup npm run dev > /tmp/backend.log 2>&1 &

# Frontend  
cd ../frontend
npm install
npm run build  # Build for production
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
nohup npm run dev > /tmp/frontend.log 2>&1 &

# Check status
curl http://localhost:5001/health
```

## Important: Environment Variables

Make sure your server has the `.env` files configured:

1. **Frontend `.env`** (in `/root/tapverse-content-creation/frontend/.env`):
   ```
   VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE
   ```

2. **Backend `.env`** (already configured, but verify):
   - Check that all API keys are set
   - Database credentials
   - Redis connection

## Verify Deployment

```bash
# Check backend
curl http://77.42.67.166:5001/health

# Check logs
ssh root@77.42.67.166 "tail -f /tmp/backend.log"
ssh root@77.42.67.166 "tail -f /tmp/frontend.log"
```

## New Features Deployed

✅ Complete system rewrite with new architecture
✅ Left sidebar navigation
✅ Dashboard page
✅ Clients with nested projects
✅ SEO Blog workflow (6 steps)
✅ Programmatic SEO workflow (5 steps)
✅ CMS integration
✅ Export functionality
✅ Approval workflow
