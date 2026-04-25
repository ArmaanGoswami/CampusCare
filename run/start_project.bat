@echo off
set "ROOT_DIR=%~dp0..\"
echo Starting Smart Campus Project from %ROOT_DIR%

:: Start Backend
echo Starting Backend (Flask)...
start "Backend" cmd /k "cd /d %ROOT_DIR%smart-resolve\backend && ..\..\.venv\Scripts\python.exe app.py"

:: Start Frontend
echo Starting Frontend (Vite)...
start "Frontend" cmd /k "cd /d %ROOT_DIR%smart-resolve && npm run dev"

echo Done! Both servers are starting in separate windows.
pause
