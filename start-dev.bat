@echo off
echo Starting Modern E-Library System...
echo.

echo Starting MongoDB (if installed locally)...
start "MongoDB" cmd /c "mongod --dbpath C:\data\db"
timeout /t 3 >nul

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

echo.
echo Starting Frontend Development Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo ===================================
echo    Modern E-Library System Started
echo ===================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
