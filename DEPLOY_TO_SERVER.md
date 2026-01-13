# Deploy to Dev Server (77.42.67.166)

## Quick Deploy Instructions

### Option 1: Using Git (Recommended)

1. **On your local machine, commit and push:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push
   ```

2. **On the server (SSH in):**
   ```bash
   ssh your-user@77.42.67.166
   cd /path/to/project
   git pull
   chmod +x setup-server.sh
   ./setup-server.sh
   ```

### Option 2: Upload Files via SCP

1. **Upload project to server:**
   ```bash
   # From your local machine
   scp -r . your-user@77.42.67.166:/path/to/tapverse-content-creation
   ```

2. **SSH into server:**
   ```bash
   ssh your-user@77.42.67.166
   cd /path/to/tapverse-content-creation
   chmod +x setup-server.sh
   ./setup-server.sh
   ```

### Option 3: Manual Setup on Server

1. **SSH into server:**
   ```bash
   ssh your-user@77.42.67.166
   ```

2. **Clone or upload the project files**

3. **Run setup script:**
   ```bash
   cd tapverse-content-creation
   chmod +x setup-server.sh
   ./setup-server.sh
   ```

## What the Setup Script Does

1. ✅ Installs Node.js 18 (if needed)
2. ✅ Installs PostgreSQL 14 (if needed)
3. ✅ Installs Redis (if needed)
4. ✅ Creates database `tapverse_content`
5. ✅ Installs all npm dependencies
6. ✅ Creates .env file from template
7. ✅ Runs database migrations
8. ✅ Runs tests

## After Setup

1. **Edit environment variables:**
   ```bash
   cd backend
   nano .env
   ```
   
   Update these values:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tapverse_content
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   ANTHROPIC_API_KEY=your_api_key
   
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://77.42.67.166:5173
   ```

2. **Run migrations again (if .env was updated):**
   ```bash
   cd backend
   npm run db:migrate
   npm test
   ```

3. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Access URLs

- **Backend API:** http://77.42.67.166:3001
- **Frontend:** http://77.42.67.166:5173
- **Health Check:** http://77.42.67.166:3001/health

## Firewall Setup

Make sure these ports are open:
- 3001 (Backend API)
- 5173 (Frontend dev server)
- 5432 (PostgreSQL - usually localhost only)
- 6379 (Redis - usually localhost only)

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Update .env to use Docker services
DB_HOST=postgres
REDIS_HOST=redis
```

## Troubleshooting

- **Permission denied:** Run with `sudo` or check file permissions
- **Port already in use:** Change PORT in .env or stop conflicting services
- **Database connection failed:** Check PostgreSQL is running: `sudo systemctl status postgresql`
- **Redis connection failed:** Check Redis is running: `sudo systemctl status redis-server`

## Next Steps

Once setup completes and tests pass ✅:
- We can proceed with TDD development
- Each feature will be built with tests
- Tests must pass before moving to next step

