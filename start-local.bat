@echo off
echo ==============================================
echo   TRPG Palette Tool - Local Dev Environment
echo ==============================================
echo.

echo [1/3] Checking Backend Dependencies...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
cd ..

echo.
echo [2/3] Checking Frontend Dependencies...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
cd ..

echo.
echo [3/3] Starting Services...
:: Start the Node.js backend server
start "Backend Server (Socket.io - Port 3001)" cmd /k "cd backend && title Backend Server && npm start"

:: Wait 2 seconds for the server to be ready
timeout /t 2 /nobreak >nul

:: Start the Vite React frontend
start "Frontend App (Vite React)" cmd /k "cd frontend && title Frontend App && npm run dev"

echo.
echo ==============================================
echo [SUCCESS]
echo Both backend and frontend have been started in new windows!
echo - Backend log: Check the 'Backend Server' window.
echo - Frontend link: Check the 'Frontend App' window (usually http://localhost:5173).
echo.
echo Testing Tips:
echo You can open multiple browser tabs (Incognito/Private)
echo to simulate multiple players joining the same room.
echo Close the two new command windows to stop the servers.
echo ==============================================
pause
