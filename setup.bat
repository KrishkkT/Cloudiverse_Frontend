@echo off
echo 🔧 Setting up Multi-Cloud AI Infrastructure Planner Frontend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start the development server, run:
echo    npm run dev
echo.
echo 🏗️  To build for production, run:
echo    npm run build
echo.
echo 📖 Check out README.md and GETTING_STARTED.md for more information.
echo.
pause