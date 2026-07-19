@echo off
setlocal
title StratGuard AI Launcher

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "BACKEND_PYTHON=%BACKEND_DIR%\.venv\Scripts\python.exe"

if not exist "%BACKEND_PYTHON%" (
  echo.
  echo StratGuard AI could not find the backend virtual environment.
  echo Expected: "%BACKEND_PYTHON%"
  echo.
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\node_modules\.bin\vite.cmd" (
  echo.
  echo StratGuard AI could not find frontend dependencies.
  echo Run "npm ci" inside the frontend folder, then try again.
  echo.
  pause
  exit /b 1
)

echo Starting StratGuard AI...
start "StratGuard AI API" /min cmd /k "cd /d \"%BACKEND_DIR%\" && \"%BACKEND_PYTHON%\" -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
start "StratGuard AI Website" /min cmd /k "cd /d \"%FRONTEND_DIR%\" && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5173"

echo StratGuard AI is opening at http://127.0.0.1:5173
echo Keep the two minimized StratGuard AI windows open while using the website.
timeout /t 4 /nobreak >nul
endlocal
