#!/bin/bash
# Verify Deployment Status - Run this ON THE SERVER

echo "🔍 Checking Deployment Status for app.tapverse.ai..."
echo ""

# Check project directory
if [ -d "/root/tapverse-content-creation" ]; then
    PROJECT_DIR="/root/tapverse-content-creation"
elif [ -d "/root/tapverse-content-app" ]; then
    PROJECT_DIR="/root/tapverse-content-app"
else
    echo "❌ Project directory not found!"
    exit 1
fi

cd $PROJECT_DIR
echo "📁 Project: $PROJECT_DIR"
echo "📦 Git status:"
git status --short
echo ""

# Check if services are running
echo "🔍 Checking services..."
echo "Backend (port 5001):"
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "  ✅ Running (PID: $(lsof -ti:5001))"
    curl -s http://localhost:5001/health | head -3
else
    echo "  ❌ Not running"
fi

echo ""
echo "Frontend (port 3001):"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "  ✅ Running (PID: $(lsof -ti:3001))"
else
    echo "  ❌ Not running"
fi

echo ""
echo "Nginx:"
if systemctl is-active --quiet nginx; then
    echo "  ✅ Running"
    nginx -t 2>&1 | head -2
else
    echo "  ❌ Not running"
fi

echo ""
echo "📋 Recent logs:"
echo "Backend (last 5 lines):"
tail -5 /tmp/backend.log 2>/dev/null || echo "  No logs found"
echo ""
echo "Frontend (last 5 lines):"
tail -5 /tmp/frontend.log 2>/dev/null || echo "  No logs found"

echo ""
echo "🌐 Testing endpoints:"
echo "  Local backend: $(curl -s http://localhost:5001/health 2>/dev/null | head -1 || echo 'Failed')"
echo "  Domain: https://app.tapverse.ai/health"
