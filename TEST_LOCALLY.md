# Test New System Locally

## Quick Start

### Option 1: Use the Script (Easiest)

Run this in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File start-local.ps1
```

This will:
- ✅ Create frontend .env with Google Places API key
- ✅ Install dependencies if needed
- ✅ Start backend on port 5001
- ✅ Start frontend on port 5173
- ✅ Open in separate windows

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
# Create .env file with:
# VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg
npm run dev
```

## Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

## What to Test

### 1. Navigation
- [ ] Left sidebar visible (not top bar)
- [ ] Only: Home, Clients, Settings
- [ ] Logo at top of sidebar

### 2. Dashboard
- [ ] Visit http://localhost:5173/
- [ ] Should show Dashboard (not old welcome page)
- [ ] Stats cards visible
- [ ] Quick actions section

### 3. Clients Page
- [ ] Visit http://localhost:5173/clients
- [ ] Clients shown as cards (not table)
- [ ] "View Details" button works
- [ ] Clicking client shows projects below

### 4. Projects
- [ ] Projects nested under clients
- [ ] Project cards visible
- [ ] Clicking project shows content type cards

### 5. Content Type Cards
- [ ] Horizontal cards at top of project
- [ ] Only "SEO Blog" and "Programmatic SEO" visible
- [ ] Cards are clickable

### 6. SEO Blog Workflow
- [ ] Click "SEO Blog Content" card
- [ ] 6-step workflow appears
- [ ] Progress steps visible
- [ ] Can navigate through steps

### 7. Programmatic SEO Workflow
- [ ] Click "Programmatic SEO" card
- [ ] 5-step workflow appears
- [ ] Google Places autocomplete works (if API key set)

## Common Issues

### Issue: Port Already in Use
```powershell
# Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Dependencies Not Installed
```powershell
cd backend
npm install

cd ../frontend
npm install
```

### Issue: Google Places Not Working
- Check frontend/.env exists
- Verify API key is correct
- Check browser console for errors

### Issue: Backend Not Starting
- Check backend/.env exists
- Verify database is running
- Check backend logs

## After Testing

If everything works locally:
1. ✅ Commit any local changes
2. ✅ Push to GitHub
3. ✅ Deploy to server using deployment script

If you find issues:
- Note what's broken
- Check browser console (F12)
- Check backend logs
- Let me know and I'll fix it!
