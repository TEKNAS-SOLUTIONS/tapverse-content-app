# Deployment Guide - Tapverse Content Automation System

**Purpose:** Reliable, repeatable deployment process for the Tapverse application  
**Server:** 77.42.67.166 (app.tapverse.ai)  
**Last Updated:** January 17, 2025

---

## 📋 Prerequisites

1. **SSH Access:**
   ```bash
   ssh root@77.42.67.166
   ```

2. **Server Directory Structure:**
   ```
   /root/tapverse-content-creation/
   ├── backend/
   ├── frontend/
   └── ...
   ```

3. **Ports:**
   - Backend: 5001
   - Frontend: 3001
   - PostgreSQL: 5432

---

## 🚀 Standard Deployment Process

### Step 1: Pull Latest Code from GitHub

**On Your Local Machine:**
```bash
cd /path/to/tapverse-content-creation
git add .
git commit -m "Your commit message"
git push origin main
```

**On Server (via SSH):**
```bash
ssh root@77.42.67.166
cd /root/tapverse-content-creation
git pull origin main
```

**If git pull fails (not a git repo):** Use SCP method instead (see Alternative Method below)

---

### Step 2: Install Dependencies (if package.json changed)

**Backend:**
```bash
cd /root/tapverse-content-creation/backend
npm install
```

**Frontend:**
```bash
cd /root/tapverse-content-creation/frontend
npm install
```

---

### Step 3: Run Database Migrations (if any new migration files)

```bash
# Check for new migration files
ls -lt /root/tapverse-content-creation/backend/src/db/migrations/ | head -5

# Run specific migration
cd /root/tapverse-content-creation/backend
cat src/db/migrations/XXX_migration_name.sql | sudo -u postgres psql -d tapverse_content

# Or run all pending migrations (if you have a migration script)
npm run db:migrate
```

---

### Step 4: Restart Backend Server

**Method A: Using PM2 (Recommended if installed)**
```bash
pm2 restart tapverse-backend
pm2 logs tapverse-backend --lines 20
```

**Method B: Using Screen (If PM2 not available)**
```bash
# Check if screen session exists
screen -ls

# If exists, attach and restart
screen -r backend
# Press Ctrl+C to stop, then:
npm run dev
# Press Ctrl+A then D to detach

# If no screen session, create new one
screen -S backend -d -m bash -c "cd /root/tapverse-content-creation/backend && npm run dev"
```

**Method C: Kill and Restart Process (If using nohup)**
```bash
# Find process on port 5001
lsof -ti:5001 | xargs kill -9

# Restart with nohup
cd /root/tapverse-content-creation/backend
nohup npm run dev > /tmp/backend.log 2>&1 &

# Verify
tail -20 /tmp/backend.log
```

---

### Step 5: Restart Frontend Server

**Method A: Using PM2**
```bash
pm2 restart tapverse-frontend
pm2 logs tapverse-frontend --lines 20
```

**Method B: Using Nohup (Standard Method)**
```bash
# Kill existing process on port 3001
lsof -ti:3001 | xargs kill -9
sleep 2

# Restart frontend
cd /root/tapverse-content-creation/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &

# Wait for startup
sleep 5

# Verify it's running on correct port
tail -15 /tmp/frontend.log
netstat -tlnp | grep ':3001'
```

---

### Step 6: Verify Deployment

**Backend Health Check:**
```bash
curl http://localhost:5001/health
# Expected: {"status":"ok","database":"connected","timestamp":"..."}
```

**Frontend Check:**
```bash
curl -s http://localhost:3001 | head -10
# Should return HTML content
```

**Port Verification:**
```bash
netstat -tlnp | grep -E ':(3001|5001)'
# Should show both ports listening
```

**From Browser:**
- Visit: `https://app.tapverse.ai` or `http://77.42.67.166:3001`
- Test the specific features that were fixed

---

## 🔄 Alternative Deployment Method (SCP)

**Use this when git is not configured on server:**

**1. Push to GitHub from local:**
```bash
cd /path/to/tapverse-content-creation
git add .
git commit -m "Deployment: Fix description"
git push origin main
```

**2. Upload files via SCP:**
```bash
# Frontend files
cd /path/to/tapverse-content-creation
scp -r frontend/src root@77.42.67.166:/root/tapverse-content-creation/frontend/

# Backend files (if changed)
scp -r backend/src root@77.42.67.166:/root/tapverse-content-creation/backend/

# Migration files (if new)
scp backend/src/db/migrations/XXX_new_migration.sql root@77.42.67.166:/root/tapverse-content-creation/backend/src/db/migrations/
```

**3. Then run Steps 3-6 above**

---

## 📝 Deployment Checklist

Use this checklist for every deployment:

- [ ] Code committed and pushed to GitHub
- [ ] Server code updated (git pull or SCP)
- [ ] Dependencies installed (if package.json changed)
- [ ] Database migrations run (if any new migrations)
- [ ] Backend server restarted
- [ ] Frontend server restarted
- [ ] Backend health check passing
- [ ] Frontend accessible on port 3001
- [ ] Test critical features manually
- [ ] Verify fixes are working

---

## 🛠️ Troubleshooting

### Frontend Not Starting

**Problem:** Port 3001 in use or frontend won't start

**Solution:**
```bash
# Kill all node processes (be careful!)
killall -9 node

# Or kill specific port
lsof -ti:3001 | xargs kill -9

# Clear npm cache if needed
cd /root/tapverse-content-creation/frontend
rm -rf node_modules/.vite
npm cache clean --force

# Restart
nohup npm run dev > /tmp/frontend.log 2>&1 &
tail -20 /tmp/frontend.log
```

### Backend Not Starting

**Problem:** Backend port 5001 in use or errors

**Solution:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Check for syntax errors
cd /root/tapverse-content-creation/backend
node -c src/server.js

# Restart
nohup npm run dev > /tmp/backend.log 2>&1 &
tail -20 /tmp/backend.log
```

### Database Migration Fails

**Problem:** Migration script fails

**Solution:**
```bash
# Check if table exists
sudo -u postgres psql -d tapverse_content -c "\dt system_settings"

# Check migration file syntax
cat /root/tapverse-content-creation/backend/src/db/migrations/XXX_migration.sql

# Run migration manually
cd /root/tapverse-content-creation/backend
cat src/db/migrations/XXX_migration.sql | sudo -u postgres psql -d tapverse_content
```

### Changes Not Reflecting

**Problem:** Code changes not showing after restart

**Solution:**
```bash
# Verify files are updated on server
ls -lt /root/tapverse-content-creation/frontend/src/pages/

# Clear browser cache
# Or do hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Check if servers are actually using new files
# Restart servers again
```

---

## 🎯 Quick Deploy Script (Recommended)

Create this script for one-command deployment:

### `deploy.sh` (Run on Server)

```bash
#!/bin/bash
# Tapverse Deployment Script
# Usage: ./deploy.sh [backend|frontend|all]

set -e  # Exit on error

SERVER_DIR="/root/tapverse-content-creation"
LOG_DIR="/tmp"

deploy_backend() {
    echo "🚀 Deploying Backend..."
    cd $SERVER_DIR/backend
    
    # Kill existing process
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Install dependencies if package.json changed
    # npm install
    
    # Restart backend
    nohup npm run dev > $LOG_DIR/backend.log 2>&1 &
    sleep 3
    
    # Verify
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ Backend deployed successfully on port 5001"
        tail -5 $LOG_DIR/backend.log
    else
        echo "❌ Backend deployment failed"
        tail -20 $LOG_DIR/backend.log
        exit 1
    fi
}

deploy_frontend() {
    echo "🚀 Deploying Frontend..."
    cd $SERVER_DIR/frontend
    
    # Kill existing process
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Install dependencies if package.json changed
    # npm install
    
    # Restart frontend
    nohup npm run dev > $LOG_DIR/frontend.log 2>&1 &
    sleep 5
    
    # Verify
    if netstat -tlnp | grep -q ':3001'; then
        echo "✅ Frontend deployed successfully on port 3001"
        tail -5 $LOG_DIR/frontend.log
    else
        echo "❌ Frontend deployment failed"
        tail -20 $LOG_DIR/frontend.log
        exit 1
    fi
}

deploy_all() {
    echo "🚀 Deploying All Services..."
    deploy_backend
    deploy_frontend
    echo ""
    echo "✅ Deployment Complete!"
    echo "Backend: http://localhost:5001"
    echo "Frontend: http://localhost:3001"
}

# Main
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_all
        ;;
    *)
        echo "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac
```

**To use:**
```bash
# Upload script to server
scp deploy.sh root@77.42.67.166:/root/tapverse-content-creation/

# SSH into server
ssh root@77.42.67.166

# Make executable
chmod +x /root/tapverse-content-creation/deploy.sh

# Run deployment
cd /root/tapverse-content-creation
./deploy.sh all
```

---

## 📊 Health Check Endpoints

**Backend:**
- Health: `http://localhost:5001/health`
- API Root: `http://localhost:5001/api`

**Frontend:**
- Root: `http://localhost:3001`
- Production: `https://app.tapverse.ai`

---

## 🔐 Security Notes

1. **Never commit `.env` files** - Use environment variables on server
2. **Use SSH keys** - Avoid password authentication
3. **Backup database** before migrations
4. **Test on staging** before production (if available)

---

## 📞 Support

If deployment fails:
1. Check logs: `/tmp/backend.log` and `/tmp/frontend.log`
2. Verify ports: `netstat -tlnp | grep -E ':(3001|5001)'`
3. Check processes: `ps aux | grep -E 'node|npm'`
4. Review this guide for troubleshooting section

---

**Last Deployment:** January 17, 2025  
**Status:** ✅ Working  
**Verified By:** Deployment automation
