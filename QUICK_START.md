# Quick Start Guide - Fix "Site Can't Be Reached"

## The Problem
The servers aren't running, so you can't access the site.

## Solution: Start Both Servers

### Step 1: Open TWO PowerShell/Terminal Windows

### Step 2: Start Backend (Terminal 1)

```powershell
cd C:\Users\sanke\projects\tapverse-content-app\backend
npm run dev
```

**You should see:**
```
Server started on port 5001
```

**If you see errors:**
- Check if you have `backend/.env` file
- Check if database is running
- Look at the error message

### Step 3: Start Frontend (Terminal 2)

```powershell
cd C:\Users\sanke\projects\tapverse-content-app\frontend
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open Browser

Open: **http://localhost:5173**

## Verify Servers Are Running

**Check Backend:**
```powershell
curl http://localhost:5001/health
```

Should return: `{"status":"ok","database":"connected",...}`

**Check Frontend:**
```powershell
curl http://localhost:5173
```

Should return HTML.

## Common Issues

### Issue: "Port already in use"

**Kill process on port 5001:**
```powershell
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

**Kill process on port 5173:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Issue: "Cannot find module"

**Reinstall dependencies:**
```powershell
cd backend
npm install

cd ../frontend
npm install
```

### Issue: Backend won't start

**Check backend/.env exists:**
- Database connection settings
- API keys

**Check database is running:**
- PostgreSQL should be running
- Check connection in backend/.env

### Issue: Frontend won't start

**Check frontend/.env exists:**
```powershell
# Should contain:
VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE
```

## Quick Test Script

Run this to check if servers are running:

```powershell
# Check Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -TimeoutSec 2
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
}

# Check Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2
    Write-Host "✅ Frontend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
}
```

## Still Not Working?

1. **Check both terminal windows for error messages**
2. **Make sure you're in the correct directories**
3. **Verify node_modules are installed** (`npm install` in both folders)
4. **Check firewall isn't blocking ports 5001 and 5173**
