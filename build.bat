@echo off
echo 🏗️ Building Multi-Cloud AI Infrastructure Planner for Production...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📦 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Build failed.
    pause
    exit /b 1
)

echo.
echo ✅ Build complete! Output files are in the dist/ directory.
echo.
pause