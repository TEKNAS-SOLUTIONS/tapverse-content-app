# Start Local Development

## Quick Start

### Step 1: Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### Step 2: Create Environment Files

**Frontend .env** (create `frontend/.env`):
```
VITE_GOOGLE_PLACES_API_KEY=AIzaSyDX9d2X9taZXh7WIp1BuH6C0px9gAqYtqg
```

**Backend .env** (if not exists, copy from `backend/.env.example`):
- Database credentials
- API keys
- Redis connection

### Step 3: Start Services

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Backend will run on: http://localhost:5001

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### Step 4: Test

1. Open browser: http://localhost:5173
2. You should see:
   - ✅ Left sidebar with Home, Clients, Settings
   - ✅ Dashboard page (not old welcome page)
   - ✅ New UI design

## What to Test

- [ ] Left sidebar navigation
- [ ] Dashboard page loads
- [ ] Clients page shows cards
- [ ] Click client → see projects
- [ ] Click project → see content type cards
- [ ] SEO Blog workflow works
- [ ] Programmatic SEO workflow works

## Troubleshooting

**Port already in use:**
```powershell
# Find and kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Find and kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Dependencies error:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Build errors:**
- Check browser console (F12)
- Check terminal for errors
- Verify all dependencies installed
