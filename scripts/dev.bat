@echo off
REM ==============================================================================
REM Zenvora Local Development Runner for Windows
REM ==============================================================================

if not exist .env (
    echo Copying .env.example to .env...
    copy .env.example .env
)

echo Starting Zenvora Backend and Frontend...
start "Zenvora Backend API" cmd /k "cd backend && npm run dev"
start "Zenvora Frontend SPA" cmd /k "cd frontend && npm run dev"

echo Both services launched in separate windows!
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
