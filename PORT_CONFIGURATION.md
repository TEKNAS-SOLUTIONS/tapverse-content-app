# Port Configuration

## Current Port Setup

✅ **No conflicts with your existing apps!**

- **Frontend:** Port `5173` (changed from 3000)
- **Backend API:** Port `5001` (unchanged)
- **Your Other App:** Port `3000` (not touched)

## Why These Ports?

- **5173** - Vite's default development port (safe, rarely used)
- **5001** - Common backend port, not conflicting
- **3000** - Left for your other app

## Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

## Configuration Files Updated

1. ✅ `frontend/vite.config.js` - Port set to 5173
2. ✅ `backend/src/config/config.js` - Frontend URL updated to 5173
3. ✅ `backend/src/server.js` - CORS origin updated to 5173
4. ✅ All documentation updated

## To Start Locally

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Runs on: http://localhost:5001

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Runs on: http://localhost:5173

## Troubleshooting

**If port 5173 is in use:**
```powershell
# Find what's using it
netstat -ano | findstr :5173

# Kill if needed (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**If port 5001 is in use:**
```powershell
# Find what's using it
netstat -ano | findstr :5001

# Or change backend port in backend/.env:
# PORT=5002
```

## Verify Ports Are Free

```powershell
# Check all our ports
netstat -ano | findstr "LISTENING" | findstr ":5001 :5173"
```

If nothing shows, ports are free! ✅
