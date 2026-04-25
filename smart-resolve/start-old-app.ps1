$ErrorActionPreference = 'Stop'

$frontendDir = $PSScriptRoot
$workspaceDir = Split-Path -Parent $frontendDir
$backendDir = Join-Path $frontendDir 'backend'
$pythonExe = Join-Path $workspaceDir '.venv\Scripts\python.exe'

if (-not (Test-Path $backendDir)) {
  Write-Error "Backend folder not found: $backendDir"
}

if (-not (Test-Path $pythonExe)) {
  Write-Host "Python venv not found at $pythonExe" -ForegroundColor Yellow
  Write-Host "Falling back to system python command." -ForegroundColor Yellow
  $backendCommand = "Set-Location '$backendDir'; python app.py"
} else {
  $backendCommand = "Set-Location '$backendDir'; & '$pythonExe' app.py"
}

$frontendCommand = "Set-Location '$frontendDir'; npm run dev -- --host"

Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCommand | Out-Null
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCommand | Out-Null

Write-Host 'Started Smart Resolve old app in two terminals:' -ForegroundColor Green
Write-Host '1) Backend: http://localhost:5000' -ForegroundColor Green
Write-Host '2) Frontend: check URL printed by Vite (usually http://localhost:5173 or http://localhost:5174)' -ForegroundColor Green
