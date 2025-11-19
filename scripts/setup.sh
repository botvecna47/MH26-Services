#!/bin/bash

# MH26 Services Setup Script
# This script sets up the development environment

echo "🚀 MH26 Services Setup"
echo "===================="
echo ""

# Check prerequisites
echo "📦 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm --version)"

# Check PostgreSQL connection (optional check)
echo ""
echo "📊 Checking database connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
else
    echo "⚠️  PostgreSQL client not found (optional - ensure PostgreSQL is running)"
fi

# Check Redis connection (optional check)
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis client found"
else
    echo "⚠️  Redis client not found (optional - rate limiting will use in-memory store)"
fi

echo ""

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env file not found!"
    echo "⚠️  Please create server/.env file with required environment variables"
    echo "⚠️  See server/.env.example for reference (if available)"
    echo ""
    echo "Press Enter to continue anyway or Ctrl+C to exit..."
    read
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

if [ ! -d "node_modules" ]; then
    echo "  Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install root dependencies"
        exit 1
    fi
fi

if [ ! -d "server/node_modules" ]; then
    echo "  Installing server dependencies..."
    cd server
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install server dependencies"
        exit 1
    fi
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
fi

# Generate Prisma client
echo ""
echo "📦 Setting up database..."
cd server

if [ ! -d "node_modules/@prisma/client" ]; then
    echo "  Generating Prisma client..."
    npm run generate
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi
fi

# Run migrations
echo "  Running database migrations..."
npm run migrate:dev
if [ $? -ne 0 ]; then
    echo "⚠️  Database migration failed. Make sure PostgreSQL is running and DATABASE_URL is correct."
    echo "⚠️  Continuing anyway..."
fi

# Seed database (optional)
echo ""
read -p "  Do you want to seed the database with test data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  Seeding database..."
    npm run seed
    if [ $? -ne 0 ]; then
        echo "⚠️  Database seeding failed. Continuing anyway..."
    fi
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Ensure PostgreSQL is running on port 5432"
echo "  2. Ensure Redis is running on port 6379 (optional)"
echo "  3. Update server/.env with your database credentials"
echo ""
echo "🚀 To start the development servers:"
echo "  npm run dev"
echo ""
echo "📍 Access points:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000/api"
echo ""
