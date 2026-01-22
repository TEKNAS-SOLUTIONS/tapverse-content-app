# Deployment Instructions

## Quick Deploy (Copy-Paste These Commands)

### Step 1: SSH into Server
```bash
ssh root@77.42.67.166
```

### Step 2: Run Deployment Commands
Once you're SSH'd in, run these commands:

```bash
cd /root/tapverse-content-creation
git pull origin main
cd backend && npm install && npm run db:migrate
cd ../frontend && npm install
echo "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" >> .env
npm run build
cd .. && chmod +x deploy.sh && ./deploy.sh all
```

### Step 3: Verify
```bash
curl http://localhost:5001/health
```

## Alternative: Upload and Run Script

If you prefer, you can upload the `deploy-remote.sh` script:

```bash
# From your local machine
scp deploy-remote.sh root@77.42.67.166:/root/tapverse-content-creation/

# Then SSH in and run it
ssh root@77.42.67.166
cd /root/tapverse-content-creation
chmod +x deploy-remote.sh
./deploy-remote.sh
```

## What Gets Deployed

✅ Complete system rewrite
✅ New left sidebar navigation
✅ Dashboard page
✅ Clients with nested projects  
✅ SEO Blog workflow
✅ Programmatic SEO workflow
✅ CMS integration
✅ Export functionality
✅ All new components and features

## Troubleshooting

If deployment fails:
1. Check logs: `tail -f /tmp/backend.log` and `tail -f /tmp/frontend.log`
2. Verify ports: `netstat -tlnp | grep -E '5001|3001'`
3. Check processes: `ps aux | grep node`
4. Restart manually: `./deploy.sh backend` or `./deploy.sh frontend`
