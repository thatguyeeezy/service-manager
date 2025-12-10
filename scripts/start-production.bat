@echo off
echo Starting Service Manager Panel (Production Mode)...
echo.

REM Build Next.js app
echo Building Next.js application...
call npm run build

REM Start WebSocket server in background
echo Starting WebSocket server...
start "Service Manager WS" cmd /k "npm run ws"

REM Wait a bit for WS server to start
timeout /t 2 /nobreak >nul

REM Start Next.js production server
echo Starting Next.js production server...
echo.
echo Service Manager Panel will be available at: http://localhost:3000
echo WebSocket server running on port: 3001
echo.

call npm start

