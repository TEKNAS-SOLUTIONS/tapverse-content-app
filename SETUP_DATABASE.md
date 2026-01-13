# Database Setup Guide - Local Development

## Installation Steps

### Step 1: Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the on-screen instructions to add Homebrew to your PATH.

### Step 2: Install PostgreSQL

```bash
brew install postgresql@14
```

### Step 3: Start PostgreSQL Service

```bash
brew services start postgresql@14
```

### Step 4: Create Database

```bash
createdb tapverse_content
```

If `createdb` command not found, use:
```bash
psql postgres -c "CREATE DATABASE tapverse_content;"
```

### Step 5: Run Migrations

```bash
cd backend
npm run db:migrate
```

### Step 6: Set Environment Variables

Create `.env` file in backend directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials (default Homebrew setup):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tapverse_content
DB_USER=$(whoami)
DB_PASSWORD=
```

### Step 7: Run Tests

```bash
npm test
```

Tests should now pass! ✅

## Alternative: PostgreSQL.app (GUI Option)

1. Download from: https://postgresapp.com/
2. Install and start the app
3. Click "Initialize" to create a new server
4. Use default settings (port 5432)
5. Create database:
   ```bash
   /Applications/Postgres.app/Contents/Versions/latest/bin/createdb tapverse_content
   ```

## Verify Installation

```bash
psql -d tapverse_content -c "SELECT version();"
```

## Troubleshooting

- **Command not found**: Add PostgreSQL bin to PATH
  ```bash
  echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

- **Connection refused**: Make sure PostgreSQL service is running
  ```bash
  brew services list
  brew services start postgresql@14
  ```

- **Authentication failed**: Check your `.env` file credentials

