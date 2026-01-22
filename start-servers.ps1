# Start Both Servers - Tapverse Content App
# This script will start backend and frontend in separate windows

Write-Host "🚀 Starting Tapverse Content App Servers..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if .env files exist
if (-not (Test-Path "frontend\.env")) {
    Write-Host "📝 Creating frontend/.env..." -ForegroundColor Yellow
    "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
}

# Check if node_modules exist
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🔄 Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes on our ports
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
$port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port5001) {
    $pid = $port5001.OwningProcess
    Write-Host "   Killing process on port 5001 (PID: $pid)" -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

if ($port5173) {
    $pid = $port5173.OwningProcess
    Write-Host "   Killing process on port 5173 (PID: $pid)" -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Start Backend
Write-Host "🔧 Starting Backend on http://localhost:5001..." -ForegroundColor Green
$backendScript = @"
cd '$PWD\backend'
`$env:NODE_ENV = 'development'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "🎨 Starting Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendScript = @"
cd '$PWD\frontend'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "✅ Servers should be starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  🔧 Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "  ❤️  Health:   http://localhost:5001/health" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Waiting a few seconds for servers to fully start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test if servers are responding
Write-Host ""
Write-Host "🔍 Testing server connections..." -ForegroundColor Cyan

try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:5001/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ Backend is responding!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend not responding yet (may still be starting)" -ForegroundColor Yellow
    Write-Host "     Check the backend PowerShell window for errors" -ForegroundColor Yellow
}

try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ Frontend is responding!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Frontend not responding yet (may still be starting)" -ForegroundColor Yellow
    Write-Host "     Check the frontend PowerShell window for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check the two PowerShell windows that opened" -ForegroundColor White
Write-Host "  2. Look for any error messages" -ForegroundColor White
Write-Host "  3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  To stop servers: Close the PowerShell windows or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""
