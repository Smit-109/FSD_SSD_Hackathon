@echo off
echo ========================================
echo    E-Library System - Development Setup
echo ========================================
echo.

echo Checking Node.js and NPM versions...
node -v
npm -v
echo.

echo Setting up Backend (Express + EJS)...
cd backend
echo Installing backend dependencies...
call npm install
echo.

echo Starting backend server with nodemon...
echo Backend will run on: http://localhost:5000
echo API endpoints available at: http://localhost:5000/api/v1/
echo EJS web interface available at: http://localhost:5000/
echo.

start "E-Library Backend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Backend server is starting...
echo    
echo    Access the application at:
echo    http://localhost:5000
echo    
echo    Demo Login Credentials:
echo    Admin: admin@library.com / admin123
echo    User:  user@library.com / user123
echo ========================================
echo.

pause