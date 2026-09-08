$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Nabha Telemedicine - local development startup" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required." }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw "Python is required." }
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { throw "PostgreSQL/psql is required. Start PostgreSQL before running this script." }

if (-not (Test-Path "backend\.env")) {
  Copy-Item "backend\.env.example" "backend\.env"
  Write-Host "Created backend\.env. Edit database password/secrets if required." -ForegroundColor Yellow
}

Write-Host "Installing backend dependencies if needed..." -ForegroundColor DarkCyan
Push-Location "$root\backend"
if (-not (Test-Path "node_modules")) { npm install }
Write-Host "Running database migrations..." -ForegroundColor DarkCyan
npm run db:migrate
Pop-Location

Write-Host "Preparing AI virtual environment..." -ForegroundColor DarkCyan
Push-Location "$root\ai-service"
if (-not (Test-Path ".venv\Scripts\python.exe")) { python -m venv .venv }
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt
Pop-Location

Write-Host "Opening backend, AI service and frontend in separate PowerShell windows..." -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\backend'; npm start"
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\ai-service'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 8001"
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\frontend'; python -m http.server 8000"

Start-Sleep -Seconds 3
Write-Host "Frontend: http://localhost:8000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000/health" -ForegroundColor Green
Write-Host "AI:       http://localhost:8001/health" -ForegroundColor Green
Write-Host "Close the three service windows to stop the local application." -ForegroundColor Gray
