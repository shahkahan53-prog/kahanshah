@echo off
title SwadBox - Python Backend
echo ==============================================
echo Starting SwadBox Python Backend (FastAPI)...
echo Running at http://localhost:8000
echo API Docs at http://localhost:8000/docs
echo ==============================================
cd /d "%~dp0backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

