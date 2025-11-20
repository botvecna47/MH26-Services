@echo off
REM MH26 Services Marketplace - Project Startup Script
REM This script starts both frontend and backend servers

echo ========================================
echo   MH26 Services Marketplace
echo   Starting Development Servers...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo.

REM Check if .env file exists in server directory
if not exist "server\.env" (
    echo [WARNING] server\.env file not found!
    echo [WARNING] Please create server\.env file with required environment variables
    echo [WARNING] See server\.env.example for reference
    echo.
    echo Press any key to continue anyway or Ctrl+C to exit...
    pause >nul
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo [INFO] Installing root dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install root dependencies
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install server dependencies
        pause
        exit /b 1
    )
    cd ..
)

if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Check if Prisma client is generated
if not exist "server\node_modules\@prisma\client" (
    echo [INFO] Generating Prisma client...
    cd server
    call npm run generate
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to generate Prisma client
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo [INFO] Starting development servers...
echo [INFO] Frontend will run on http://localhost:5173
echo [INFO] Backend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start both servers using npm script
REM Use 'start' command to run in a new window, or run directly
REM If you want to see output in the same window, use: npm run dev
REM If you want separate windows, uncomment the start commands below

REM Option 1: Run in same window (recommended for seeing all output)
echo [INFO] Launching servers...
echo.
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start servers
    echo [ERROR] Error code: %ERRORLEVEL%
    echo.
    echo Please check:
    echo   1. Are all dependencies installed? (npm install)
    echo   2. Is the database running?
    echo   3. Are ports 3000 and 5173 available?
    echo.
    pause
    exit /b 1
)

REM If we reach here, servers have stopped
echo.
echo [INFO] Servers have stopped
pause

