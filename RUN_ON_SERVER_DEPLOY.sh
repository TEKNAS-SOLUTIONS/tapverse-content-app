#!/bin/bash
# ============================================
# DEPLOYMENT SCRIPT - RUN THIS ON THE SERVER
# ============================================
# After SSH'ing in (with password), copy-paste and run this entire script
# Or upload this file to server and run: bash RUN_ON_SERVER_DEPLOY.sh

set -e

echo "🚀 Starting Tapverse Deployment..."
echo ""

# Navigate to project directory
PROJECT_DIR="/root/tapverse-content-creation"
cd $PROJECT_DIR || { echo "❌ Project directory not found at $PROJECT_DIR"; exit 1; }

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code from GitHub..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Backend setup
echo "📦 Step 2: Setting up backend..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate || echo "⚠️  Migrations may have already run"
echo ""

# Step 3: Frontend setup
echo "📦 Step 3: Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Add Google Places API key
echo "🔑 Adding Google Places API key..."
if ! grep -q "VITE_GOOGLE_PLACES_API_KEY" .env 2>/dev/null; then
    echo "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" >> .env
    echo "✅ API key added to .env"
else
    echo "✅ API key already exists"
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build
echo "✅ Frontend built"
echo ""

# Step 4: Deploy services
echo "🚀 Step 4: Deploying services..."
cd ..

# Kill existing processes
echo "🛑 Stopping existing services..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No process on port 5001"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"
sleep 2

# Start backend
echo "🔄 Starting backend..."
cd backend
nohup npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Start frontend
echo "🔄 Starting frontend..."
cd ../frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
sleep 5

# Step 5: Verify deployment
echo ""
echo "🏥 Step 5: Verifying deployment..."

# Check backend
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is running and healthy on port 5001"
    curl -s http://localhost:5001/health | head -3
else
    echo "❌ Backend health check failed"
    echo "Backend logs:"
    tail -20 /tmp/backend.log
fi

# Check frontend
if netstat -tlnp 2>/dev/null | grep -q ':3001' || ss -tlnp 2>/dev/null | grep -q ':3001'; then
    echo "✅ Frontend is running on port 3001"
else
    echo "⚠️  Frontend may still be starting..."
    echo "Frontend logs:"
    tail -20 /tmp/frontend.log
fi

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "📋 Service URLs:"
echo "  Backend API: http://localhost:5001"
echo "  Frontend: http://localhost:3001"
echo "  Health Check: http://localhost:5001/health"
echo ""
echo "📋 Log Files:"
echo "  Backend: tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "📋 Process IDs:"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "To check if services are running:"
echo "  ps aux | grep node"
echo "  netstat -tlnp | grep -E '5001|3001'"
echo ""
