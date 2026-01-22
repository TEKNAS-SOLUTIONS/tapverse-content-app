# Deploy When SSH Requires Password

## Quick Method: Copy-Paste Script

### Step 1: SSH into Server
```bash
ssh root@77.42.67.166
# Enter password when prompted
```

### Step 2: Copy-Paste This Entire Script

Once you're logged in, copy and paste this entire block:

```bash
cd /root/tapverse-content-creation && \
git pull origin main && \
cd backend && npm install && npm run db:migrate && \
cd ../frontend && npm install && \
echo "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" >> .env && \
npm run build && \
cd .. && \
lsof -ti:5001 | xargs kill -9 2>/dev/null || true && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
sleep 2 && \
cd backend && nohup npm run dev > /tmp/backend.log 2>&1 & \
cd ../frontend && nohup npm run dev > /tmp/frontend.log 2>&1 & \
sleep 5 && \
curl http://localhost:5001/health
```

### Step 3: Verify
```bash
# Check backend
curl http://localhost:5001/health

# Check logs
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

## Alternative: Upload Script File

### Option A: Use SCP to Upload Script
From your local machine (Windows PowerShell):

```powershell
# Upload the deployment script
scp RUN_ON_SERVER_DEPLOY.sh root@77.42.67.166:/root/tapverse-content-creation/

# Then SSH in and run it
ssh root@77.42.67.166
cd /root/tapverse-content-creation
chmod +x RUN_ON_SERVER_DEPLOY.sh
bash RUN_ON_SERVER_DEPLOY.sh
```

### Option B: Create Script Directly on Server
After SSH'ing in:

```bash
cd /root/tapverse-content-creation
cat > deploy-now.sh << 'EOF'
#!/bin/bash
# [paste the entire RUN_ON_SERVER_DEPLOY.sh content here]
EOF

chmod +x deploy-now.sh
./deploy-now.sh
```

## Setup Passwordless SSH (For Future)

To avoid entering password every time:

### On Your Local Machine:
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096

# Copy public key to server
ssh-copy-id root@77.42.67.166
# Enter password one last time
```

### Or Manually:
```bash
# Copy your public key
cat ~/.ssh/id_rsa.pub

# SSH into server and add it
ssh root@77.42.67.166
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

After this, you won't need to enter password anymore!

## What Gets Deployed

✅ Complete system rewrite
✅ New architecture (error handling, logging, caching)
✅ Left sidebar navigation
✅ Dashboard page
✅ Clients with nested projects
✅ SEO Blog workflow (6 steps)
✅ Programmatic SEO workflow (5 steps)
✅ CMS integration
✅ Export functionality
✅ Approval workflow
✅ Google Places API integration
