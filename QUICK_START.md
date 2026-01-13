# Quick Start - Database Setup

## Option 1: Run Setup Script

```bash
./INSTALL_DB.sh
```

## Option 2: Manual Installation

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install PostgreSQL
```bash
brew install postgresql@14
```

### 3. Start PostgreSQL
```bash
brew services start postgresql@14
```

### 4. Create Database
```bash
createdb tapverse_content
```

### 5. Run Migrations
```bash
cd backend
npm run db:migrate
```

### 6. Run Tests
```bash
npm test
```

Once tests pass ✅, we can proceed to the next step!

See SETUP_DATABASE.md for detailed instructions.
