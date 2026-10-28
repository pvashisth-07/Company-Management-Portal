# ====================================================================
# LNMIIT CS314 - Company Engagement Portal (Team T066)
# PowerShell One-Click Development Server Launcher
# ====================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Starting LNMIIT Company Engagement Portal (Team T066)..." -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan

# Start Backend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Frontend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host "`nServers launched in dedicated terminal windows!" -ForegroundColor Green
Write-Host "Frontend Portal:     http://127.0.0.1:5173/" -ForegroundColor Yellow
Write-Host "Backend Swagger:     http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "`nDefault Test Password for all accounts: password123" -ForegroundColor White
