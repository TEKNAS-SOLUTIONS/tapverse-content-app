#!/bin/bash

# Server Setup Script for 77.42.67.166
# Run this script on the dev server to set up everything

set -e  # Exit on error

echo "========================================="
echo "Tapverse Content Creation - Server Setup"
echo "Server: 77.42.67.166"
echo "========================================="
echo ""

# Check if running as root for package installation
if [ "$EUID" -ne 0 ]; then 
    SUDO="sudo"
else
    SUDO=""
fi

# Step 1: Check/Install Node.js
echo "📦 Step 1/7: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | $SUDO bash -
    $SUDO apt-get install -y nodejs
    echo "✅ Node.js installed"
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
fi

# Step 2: Check/Install PostgreSQL
echo ""
echo "📦 Step 2/7: Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL 14..."
    $SUDO sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | $SUDO apt-key add -
    $SUDO apt-get update
    $SUDO apt-get install -y postgresql-14 postgresql-contrib-14
    $SUDO systemctl start postgresql
    $SUDO systemctl enable postgresql
    echo "✅ PostgreSQL installed"
else
    echo "✅ PostgreSQL found"
    $SUDO systemctl start postgresql 2>/dev/null || true
fi

# Step 3: Check/Install Redis
echo ""
echo "📦 Step 3/7: Checking Redis..."
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    $SUDO apt-get update
    $SUDO apt-get install -y redis-server
    $SUDO systemctl start redis-server
    $SUDO systemctl enable redis-server
    echo "✅ Redis installed"
else
    echo "✅ Redis found"
    $SUDO systemctl start redis-server 2>/dev/null || true
fi

# Step 4: Create database and user
echo ""
echo "📝 Step 4/7: Setting up database..."
$SUDO -u postgres psql -c "CREATE DATABASE tapverse_content;" 2>/dev/null || {
    echo "Database might already exist, continuing..."
}

# Create database user if needed (using postgres user for now)
echo "✅ Database setup complete"

# Step 5: Install project dependencies
echo ""
echo "📦 Step 5/7: Installing dependencies..."
cd backend
npm install
cd ../frontend
npm install
cd ..
echo "✅ Dependencies installed"

# Step 6: Configure environment
echo ""
echo "⚙️  Step 6/7: Setting up environment..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env file created. Please edit it with your configuration:"
    echo "   - Database credentials"
    echo "   - API keys"
    echo "   - Server IP: 77.42.67.166"
    echo ""
    echo "Edit: nano backend/.env"
else
    echo "✅ .env file exists"
fi
cd ..

# Step 7: Run migrations and tests
echo ""
echo "🗄️  Step 7/7: Running migrations and tests..."
cd backend

# Update .env with server IP if not set
if ! grep -q "FRONTEND_URL=http://77.42.67.166" .env 2>/dev/null; then
    echo "FRONTEND_URL=http://77.42.67.166:5173" >> .env
fi

npm run db:migrate || {
    echo "⚠️  Migration failed. Check database connection in .env file"
    exit 1
}

echo ""
echo "🧪 Running tests..."
npm test || {
    echo "⚠️  Some tests failed. Check configuration."
    exit 1
}

cd ..

echo ""
echo "========================================="
echo "✅ Server Setup Complete!"
echo "========================================="
echo ""
echo "Server IP: 77.42.67.166"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys and database credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://77.42.67.166:3001"
echo "Frontend will run on: http://77.42.67.166:5173"

