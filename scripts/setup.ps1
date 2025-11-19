# MH26 Services Setup Script
# This script sets up the development environment

Write-Host "🚀 MH26 Services Setup" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Check PostgreSQL connection (optional check)
Write-Host ""
Write-Host "📊 Checking database connection..." -ForegroundColor Yellow
try {
    psql --version | Out-Null
    Write-Host "✅ PostgreSQL client found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL client not found (optional - ensure PostgreSQL is running)" -ForegroundColor Yellow
}

# Check Redis connection (optional check)
try {
    redis-cli --version | Out-Null
    Write-Host "✅ Redis client found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Redis client not found (optional - rate limiting will use in-memory store)" -ForegroundColor Yellow
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  server\.env file not found!" -ForegroundColor Yellow
    Write-Host "⚠️  Please create server\.env file with required environment variables" -ForegroundColor Yellow
    Write-Host "⚠️  See server\.env.example for reference (if available)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue anyway or Ctrl+C to exit..." -ForegroundColor Yellow
    Read-Host
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing root dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "  Installing server dependencies..." -ForegroundColor Gray
    Set-Location server
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

# Generate Prisma client
Write-Host ""
Write-Host "📦 Setting up database..." -ForegroundColor Yellow
Set-Location server

if (-not (Test-Path "node_modules\@prisma\client")) {
    Write-Host "  Generating Prisma client..." -ForegroundColor Gray
    npm run generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
        exit 1
    }
}

# Run migrations
Write-Host "  Running database migrations..." -ForegroundColor Gray
npm run migrate:dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database migration failed. Make sure PostgreSQL is running and DATABASE_URL is correct." -ForegroundColor Yellow
    Write-Host "⚠️  Continuing anyway..." -ForegroundColor Yellow
}

# Seed database (optional)
Write-Host ""
$seedResponse = Read-Host "  Do you want to seed the database with test data? (y/N)"
if ($seedResponse -eq "y" -or $seedResponse -eq "Y") {
    Write-Host "  Seeding database..." -ForegroundColor Gray
    npm run seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Database seeding failed. Continuing anyway..." -ForegroundColor Yellow
    }
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Ensure PostgreSQL is running on port 5432" -ForegroundColor White
Write-Host "  2. Ensure Redis is running on port 6379 (optional)" -ForegroundColor White
Write-Host "  3. Update server\.env with your database credentials" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the development servers:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000/api" -ForegroundColor White
Write-Host ""
