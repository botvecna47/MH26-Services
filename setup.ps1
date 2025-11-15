# MH26 Services Setup Script
# This script sets up the development environment

Write-Host "🚀 MH26 Services Setup" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host ""
Write-Host "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Setup backend
Write-Host ""
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location server

# Generate Prisma client
Write-Host "  Generating Prisma client..." -ForegroundColor Gray
npm run generate

# Run migrations
Write-Host "  Running database migrations..." -ForegroundColor Gray
npm run migrate:dev

# Seed database
Write-Host "  Seeding database..." -ForegroundColor Gray
npm run seed

Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

