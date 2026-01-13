# Server Setup Guide

## Prerequisites

1. SSH access to dev server
2. Node.js 18+ installed on server
3. PostgreSQL 14+ installed on server (or Docker)
4. Redis installed on server (or Docker)

## Setup Steps

### 1. Connect to Server

```bash
ssh your-user@dev-server-ip
```

### 2. Clone/Upload Project

```bash
# If using git
git clone <repository-url>
cd tapverse-content-creation

# Or upload files via scp/sftp
```

### 3. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Set Up Database

**Option A: PostgreSQL already installed**
```bash
# Create database
sudo -u postgres createdb tapverse_content

# Or with user
createdb tapverse_content
```

**Option B: Using Docker**
```bash
# From project root
docker-compose up -d postgres redis
```

### 5. Configure Environment

```bash
cd backend
cp .env.example .env
nano .env  # Edit with server database credentials
```

Environment variables needed:
```
DB_HOST=localhost (or postgres container name if using Docker)
DB_PORT=5432
DB_NAME=tapverse_content
DB_USER=postgres (or your db user)
DB_PASSWORD=your_password

REDIS_HOST=localhost (or redis container name if using Docker)
REDIS_PORT=6379

ANTHROPIC_API_KEY=your_api_key

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://dev-server-ip:5173
```

### 6. Run Migrations

```bash
cd backend
npm run db:migrate
```

### 7. Run Tests

```bash
npm test
```

### 8. Start Services

**Backend:**
```bash
cd backend
npm run dev  # Development mode
# or
npm start    # Production mode
```

**Frontend:**
```bash
cd frontend
npm run dev  # Development mode
# or
npm run build && npm run preview  # Production mode
```

## Docker Setup (Recommended)

If using Docker, the `docker-compose.yml` file will handle PostgreSQL and Redis.

## Server Requirements

- **OS:** Linux (Ubuntu/Debian recommended)
- **Node.js:** 18+
- **PostgreSQL:** 14+
- **Redis:** 7+
- **Ports:** 3001 (backend), 5173 (frontend), 5432 (postgres), 6379 (redis)

## Next Steps

Once tests pass on the server, we can proceed with development!

