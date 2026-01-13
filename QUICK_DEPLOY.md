# Quick Deploy to Server

## Server IP: 77.42.67.166

### Step 1: Upload Files

**Option A: Using SCP (from your local machine)**
```bash
scp -r . your-user@77.42.67.166:/home/your-user/tapverse-content-creation
```

**Option B: Using Git**
```bash
# On server
git clone <your-repo-url>
cd tapverse-content-creation
```

### Step 2: Run Setup

```bash
ssh your-user@77.42.67.166
cd tapverse-content-creation
chmod +x setup-server.sh
./setup-server.sh
```

### Step 3: Configure

```bash
cd backend
nano .env  # Edit with your API keys and database password
npm run db:migrate
npm test
```

### Step 4: Start Services

```bash
# Backend
cd backend && npm run dev

# Frontend (in another terminal)
cd frontend && npm run dev
```

**Access:**
- Backend: http://77.42.67.166:3001
- Frontend: http://77.42.67.166:5173

Once tests pass ✅, we proceed!
