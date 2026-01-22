# Check Deployment Status

## Current Status
- **Domain**: https://app.tapverse.ai/
- **Status**: Appears to be empty/not loading

## Quick Checks

### 1. Check if Backend is Running
```bash
curl https://app.tapverse.ai/health
# or
curl http://77.42.67.166:5001/health
```

### 2. Check if Frontend is Running
```bash
curl https://app.tapverse.ai/
# or
curl http://77.42.67.166:3001/
```

### 3. Check Nginx Configuration
The domain should be proxying to:
- Frontend: Port 3001 (or built static files)
- Backend API: Port 5001

### 4. Verify Services on Server
SSH in and check:
```bash
ssh root@77.42.67.166
ps aux | grep node
netstat -tlnp | grep -E '5001|3001'
systemctl status nginx
```

## Common Issues

### Issue 1: Services Not Running
**Solution**: Run the deployment script
```bash
cd /root/tapverse-content-creation
bash RUN_ON_SERVER_DEPLOY.sh
```

### Issue 2: Nginx Not Configured
**Solution**: Check nginx config
```bash
cat /etc/nginx/sites-available/app.tapverse.ai
nginx -t
systemctl reload nginx
```

### Issue 3: Frontend Not Built
**Solution**: Build frontend
```bash
cd /root/tapverse-content-creation/frontend
npm run build
# Then serve the dist/ folder via nginx
```

### Issue 4: Ports Not Accessible
**Solution**: Check firewall
```bash
ufw status
# Allow ports if needed
ufw allow 80/tcp
ufw allow 443/tcp
```

## Expected Nginx Configuration

The nginx config should look like:
```nginx
server {
    listen 80;
    server_name app.tapverse.ai;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Next Steps

1. **SSH into server** and verify services are running
2. **Check nginx logs**: `tail -f /var/log/nginx/error.log`
3. **Check application logs**: `tail -f /tmp/backend.log`
4. **Verify SSL certificate** is valid: `certbot certificates`
