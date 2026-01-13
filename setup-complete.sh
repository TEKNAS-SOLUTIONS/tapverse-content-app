#!/bin/bash

# Complete Setup Script - Run this once (requires your password for Homebrew installation)
# After this runs successfully, the database will be set up and tests will pass

set -e  # Exit on error

echo "========================================="
echo "Tapverse Content Creation - Complete Setup"
echo "========================================="
echo ""

# Step 1: Install Homebrew (if not installed)
if ! command -v brew &> /dev/null; then
    echo "📦 Step 1/6: Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [ -d "/opt/homebrew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo "✅ Homebrew installed"
else
    echo "✅ Step 1/6: Homebrew already installed"
fi

# Step 2: Install PostgreSQL
echo ""
echo "📦 Step 2/6: Installing PostgreSQL..."
brew install postgresql@14

# Add PostgreSQL to PATH
if [ -d "/opt/homebrew/opt/postgresql@14/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
elif [ -d "/usr/local/opt/postgresql@14/bin" ]; then
    export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
fi

echo "✅ PostgreSQL installed"

# Step 3: Start PostgreSQL service
echo ""
echo "🚀 Step 3/6: Starting PostgreSQL service..."
brew services start postgresql@14

# Wait for PostgreSQL to start
echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

echo "✅ PostgreSQL service started"

# Step 4: Create database
echo ""
echo "📝 Step 4/6: Creating database..."
createdb tapverse_content 2>/dev/null || {
    echo "Database might already exist, continuing..."
}

echo "✅ Database created"

# Step 5: Run migrations
echo ""
echo "🗄️  Step 5/6: Running database migrations..."
cd backend
npm run db:migrate

echo "✅ Migrations completed"

# Step 6: Run tests
echo ""
echo "🧪 Step 6/6: Running tests..."
npm test

echo ""
echo "========================================="
echo "✅ Setup Complete! All tests passing!"
echo "========================================="
echo ""
echo "You can now proceed with development."
echo "To start the backend server: cd backend && npm run dev"

