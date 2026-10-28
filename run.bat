@echo off
echo ====================================================================
echo  LNMIIT CS314 - Company Engagement Portal (Team T066)
echo  Launching Backend (FastAPI :8000) and Frontend (Vite :5173)...
echo ====================================================================

start "CEP Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "CEP Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo - Web App: http://127.0.0.1:5173/
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo.
