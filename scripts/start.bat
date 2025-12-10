@echo off
echo Starting Service Manager Panel...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start WebSocket server in background
echo Starting WebSocket server...
start "Service Manager WS" cmd /k "npm run ws"

REM Wait a bit for WS server to start
timeout /t 2 /nobreak >nul

REM Start Next.js dev server
echo Starting Next.js server...
echo.
echo Service Manager Panel will be available at: http://localhost:3000
echo WebSocket server running on port: 3001
echo.
echo Press Ctrl+C to stop all servers
echo.

call npm run dev

