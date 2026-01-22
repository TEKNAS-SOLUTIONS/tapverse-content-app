#!/bin/bash
# Run this script ON THE SERVER (after SSH'ing in)
# Or copy-paste these commands one by one

set -e

echo "🚀 Starting deployment..."

# Navigate to project
cd /root/tapverse-content-creation

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Run database migrations
echo "🗄️  Running migrations..."
npm run db:migrate || echo "Migrations may have already run"

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Add Google Places API key if not exists
if ! grep -q "VITE_GOOGLE_PLACES_API_KEY" .env 2>/dev/null; then
    echo "🔑 Adding Google Places API key..."
    echo "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" >> .env
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Go back to root
cd ..

# Run deployment script
echo "🚀 Running deployment script..."
chmod +x deploy.sh
./deploy.sh all

echo "✅ Deployment complete!"
echo ""
echo "Check status:"
echo "  Backend: curl http://localhost:5001/health"
echo "  Frontend: Check if port 3001 is listening"
