@echo off
echo 🚀 Starting Multi-Cloud AI Infrastructure Planner Development Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 🔧 Starting Vite development server on http://localhost:3000
echo.
call npm run dev