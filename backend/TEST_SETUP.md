# Test Setup Guide

## Current Test Status

✅ **Jest is configured correctly** - Tests are running
✅ **Test structure is in place** - Database connection tests exist
⚠️ **PostgreSQL setup required** - Database needs to be set up before tests can pass

## Running Tests

```bash
cd backend
npm test
```

## Database Setup for Tests

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not installed):
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Or use Postgres.app for macOS
   ```

2. **Create test database**:
   ```bash
   createdb tapverse_content
   # Or
   psql -c "CREATE DATABASE tapverse_content;"
   ```

3. **Run migrations**:
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

### Option 2: Docker PostgreSQL (Recommended)

1. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:14
       environment:
         POSTGRES_DB: tapverse_content
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
     redis:
       image: redis:7
       ports:
         - "6379:6379"
   
   volumes:
     postgres_data:
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**:
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Test Results

When PostgreSQL is not running, tests will fail with connection errors (expected).

When PostgreSQL is set up correctly, tests should pass:
- ✅ Database connection test
- ✅ Simple query test
- ✅ Client pool test

## Next Steps

1. Set up PostgreSQL (use Docker or local installation)
2. Run migrations: `npm run db:migrate`
3. Run tests: `npm test`
4. Continue with TDD approach - write tests, then implement features

