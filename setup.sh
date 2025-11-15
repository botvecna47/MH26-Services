#!/bin/bash

# MH26 Services Setup Script
# This script sets up the development environment

echo "🚀 MH26 Services Setup"
echo "===================="
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"

# Start Docker services
echo ""
echo "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

# Generate Prisma client
echo "  Generating Prisma client..."
npm run generate

# Run migrations
echo "  Running database migrations..."
npm run migrate:dev

# Seed database
echo "  Seeding database..."
npm run seed

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:3000"
echo ""

