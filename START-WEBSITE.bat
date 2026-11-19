@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing React website dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)
echo Starting Saranam Ayyappa React website...
call npm run dev
pause
