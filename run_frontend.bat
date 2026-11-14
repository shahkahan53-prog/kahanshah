@echo off
title SwadBox - Frontend Web
echo ==============================================
echo Starting SwadBox Frontend (Vite Server)...
echo Running at http://localhost:5173
echo ==============================================
cd /d "%~dp0frontend-web"
npm run dev
pause

