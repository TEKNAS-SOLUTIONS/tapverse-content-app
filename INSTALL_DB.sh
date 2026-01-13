#!/bin/bash

# Database Setup Script for Local Development
# Run this script to install and set up PostgreSQL

echo "=== Tapverse Content Creation - Database Setup ==="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo "✅ Homebrew installed. Please add it to your PATH if prompted."
    echo ""
else
    echo "✅ Homebrew found"
fi

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
brew install postgresql@14

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
brew services start postgresql@14

# Wait a moment for service to start
sleep 3

# Create database
echo "📝 Creating database..."
createdb tapverse_content 2>/dev/null || psql postgres -c "CREATE DATABASE tapverse_content;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database 'tapverse_content' created"
else
    echo "⚠️  Database creation had issues. You may need to create it manually:"
    echo "   createdb tapverse_content"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Run migrations: cd backend && npm run db:migrate"
echo "2. Run tests: cd backend && npm test"
echo ""
echo "✅ Database setup complete!"

