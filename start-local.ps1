# Start Local Development Environment
# Run this script to start both backend and frontend locally

Write-Host "🚀 Starting Tapverse Local Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
$backendEnv = "backend\.env"
$frontendEnv = "frontend\.env"

if (-not (Test-Path $frontendEnv)) {
    Write-Host "📝 Creating frontend .env file..." -ForegroundColor Yellow
    "VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg" | Out-File -FilePath $frontendEnv -Encoding utf8
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
}

if (-not (Test-Path $backendEnv)) {
    Write-Host "⚠️  Backend .env not found. Please create it from backend/.env.example" -ForegroundColor Yellow
}

# Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🔄 Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "🔧 Starting backend on http://localhost:5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5001" -ForegroundColor White
Write-Host "  Health Check: http://localhost:5001/health" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  To stop: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""
