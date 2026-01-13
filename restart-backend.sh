#!/bin/bash

# Restart Backend Script
# This script restarts the Tapverse backend service

echo "🔄 Restarting Tapverse Backend..."

# Kill existing backend processes
echo "Stopping existing backend processes..."
ssh root@77.42.67.166 'pkill -f "node src/server" || true'
sleep 2

# Start backend
echo "Starting backend..."
ssh root@77.42.67.166 'cd /root/tapverse-content-creation/backend && nohup node src/server.js > /tmp/backend.log 2>&1 &'
sleep 3

# Verify backend is running
echo "Verifying backend health..."
HEALTH=$(curl -s http://77.42.67.166/health 2>/dev/null)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Backend is running and healthy!"
    echo "$HEALTH"
else
    echo "❌ Backend health check failed"
    echo "Checking logs..."
    ssh root@77.42.67.166 'tail -20 /tmp/backend.log'
    exit 1
fi

echo "✅ Backend restart complete!"

