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
    
    # Kill existing process on port 3001
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Clear Vite cache if needed
    # rm -rf node_modules/.vite
    
    # Restart frontend
    nohup npm run dev > $LOG_DIR/frontend.log 2>&1 &
    sleep 5
    
    # Verify port is listening
    if netstat -tlnp 2>/dev/null | grep -q ':3001' || ss -tlnp 2>/dev/null | grep -q ':3001'; then
        echo "✅ Frontend deployed successfully on port 3001"
        tail -5 $LOG_DIR/frontend.log
    else
        echo "❌ Frontend deployment failed - checking logs..."
        tail -20 $LOG_DIR/frontend.log
        exit 1
    fi
}

deploy_all() {
    echo "🚀 Deploying All Services..."
    deploy_backend
    echo ""
    deploy_frontend
    echo ""
    echo "✅ Deployment Complete!"
    echo "Backend: http://localhost:5001"
    echo "Frontend: http://localhost:3001"
    echo ""
    echo "Health Check:"
    curl -s http://localhost:5001/health | head -1
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
