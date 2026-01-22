#!/bin/bash
# Deploy NEW System - This will replace the old system
# Run this ON THE SERVER after SSH'ing in

set -e

echo "🚀 Deploying NEW Tapverse System..."
echo "This will replace the old system with the new architecture"
echo ""

# Determine project directory
if [ -d "/root/tapverse-content-creation" ]; then
    PROJECT_DIR="/root/tapverse-content-creation"
elif [ -d "/root/tapverse-content-app" ]; then
    PROJECT_DIR="/root/tapverse-content-app"
else
    echo "❌ Project directory not found!"
    exit 1
fi

cd $PROJECT_DIR
echo "📁 Using directory: $PROJECT_DIR"

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main
echo "✅ Code updated"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate || echo "⚠️  Migrations may have already run"
echo ""

# Frontend setup - CRITICAL: This must be rebuilt
echo "📦 Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Add Google Places API key
if ! grep -q "VITE_GOOGLE_PLACES_API_KEY" .env 2>/dev/null; then
    echo "🔑 Adding Google Places API key..."
    echo "VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE" >> .env
fi

# CRITICAL: Clean build to remove old cached files
echo "🧹 Cleaning old build..."
rm -rf dist/
rm -rf node_modules/.vite
echo "✅ Cleaned"

# Build frontend with new code
echo "🏗️  Building NEW frontend (this may take a minute)..."
npm run build
echo "✅ Frontend built with NEW system"
echo ""

# Verify new build exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed - dist folder is empty!"
    exit 1
fi

echo "✅ New build verified:"
ls -la dist/ | head -10
echo ""

# Stop ALL existing services
echo "🛑 Stopping ALL existing services..."
pkill -f "node.*server" || true
pkill -f "vite" || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 3
echo "✅ All services stopped"
echo ""

# Start backend
echo "🔄 Starting backend on port 5001..."
cd ../backend
nohup npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
sleep 3

# Start frontend - Use preview to serve the built dist folder
echo "🔄 Starting frontend on port 3001 (serving NEW build)..."
cd ../frontend
nohup npm run preview -- --port 3001 --host 0.0.0.0 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
sleep 5

# Verify services
echo ""
echo "🏥 Verifying services..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is healthy"
    curl -s http://localhost:5001/health | head -3
else
    echo "❌ Backend health check failed"
    tail -20 /tmp/backend.log
fi

if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is serving"
else
    echo "⚠️  Frontend may still be starting..."
    tail -20 /tmp/frontend.log
fi

# Update nginx to point to correct port
echo ""
echo "🌐 Updating nginx configuration..."
NGINX_CONFIG="/etc/nginx/sites-available/app.tapverse.ai"
if [ -f "$NGINX_CONFIG" ]; then
    # Update frontend proxy to port 3001 (not 3000)
    sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://localhost:3001|g' $NGINX_CONFIG
    nginx -t && systemctl reload nginx
    echo "✅ Nginx updated and reloaded"
else
    echo "⚠️  Nginx config not found at $NGINX_CONFIG"
fi

echo ""
echo "============================================"
echo "✅ NEW SYSTEM DEPLOYED!"
echo "============================================"
echo ""
echo "🌐 Check your site: https://app.tapverse.ai"
echo "   (Clear browser cache: Ctrl+Shift+R or Cmd+Shift+R)"
echo ""
echo "📋 What should be visible:"
echo "  ✅ Left sidebar with Home, Clients, Settings"
echo "  ✅ Dashboard page (not old welcome page)"
echo "  ✅ Clients as cards (not table rows)"
echo "  ✅ Projects nested under clients"
echo "  ✅ Content type cards in projects"
echo ""
echo "📋 Logs:"
echo "  Backend: tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🔄 If you still see old system:"
echo "  1. Hard refresh browser (Ctrl+Shift+R)"
echo "  2. Clear browser cache"
echo "  3. Check: curl http://localhost:3001"
echo ""
