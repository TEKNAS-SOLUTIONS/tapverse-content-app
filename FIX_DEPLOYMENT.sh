#!/bin/bash
# Quick Fix Script - Run this on the server to fix deployment issues

echo "🔧 Fixing Deployment Issues..."

# Navigate to project
cd /root/tapverse-content-creation || cd /root/tapverse-content-app

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backend
echo "🔧 Fixing backend..."
cd backend
npm install
npm run db:migrate

# Kill existing processes
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
nohup npm run dev > /tmp/backend.log 2>&1 &
echo "✅ Backend started (PID: $!)"

# Frontend
echo "🔧 Fixing frontend..."
cd ../frontend
npm install

# Add API key if missing
if ! grep -q "VITE_GOOGLE_PLACES_API_KEY" .env 2>/dev/null; then
    echo "VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE" >> .env
fi

# Build frontend
npm run build

# Start frontend (or serve via nginx)
nohup npm run preview > /tmp/frontend.log 2>&1 &
echo "✅ Frontend started (PID: $!)"

# Wait
sleep 5

# Check health
echo ""
echo "🏥 Checking services..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is healthy"
    curl -s http://localhost:5001/health | head -3
else
    echo "❌ Backend health check failed"
    tail -20 /tmp/backend.log
fi

# Check nginx
echo ""
echo "🌐 Checking nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    nginx -t && systemctl reload nginx
else
    echo "⚠️  Nginx is not running - starting it..."
    systemctl start nginx
fi

echo ""
echo "✅ Fix complete!"
echo "Check: https://app.tapverse.ai/health"
