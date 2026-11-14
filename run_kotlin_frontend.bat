@echo off
title SwadBox - Kotlin Web Frontend
echo ==============================================
echo Starting SwadBox Kotlin Multiplatform Web...
echo ==============================================
cd /d "%~dp0frontend-kotlin"
call gradlew.bat jsBrowserDevelopmentRun
pause

