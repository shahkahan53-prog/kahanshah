@echo off
title SwadBox - Full Stack Starter
echo ========================================================
echo   Launching SwadBox (Python Backend + Frontend)
echo ========================================================
echo.

echo 1. Starting Python FastAPI Backend on http://localhost:8000 ...
start "SwadBox Backend (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. Waiting 2 seconds for backend to initialize...
timeout /t 2 /nobreak >nul

echo 3. Starting Frontend on http://localhost:5173 ...
start "SwadBox Frontend (Vite)" cmd /k "cd /d ""%~dp0frontend-web"" && npm run dev"

echo.
echo 4. Waiting for Vite dev server...
timeout /t 2 /nobreak >nul

echo 5. Opening http://localhost:5173 in browser...
start http://localhost:5173

echo.
echo ========================================================
echo   Both services are running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo ========================================================

