@echo off
echo ================================================
echo  ThreadIQ — Starting All Services
echo ================================================
echo.

echo [1/2] Starting Node.js Backend on :4000...
start "ThreadIQ Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /noisy >nul

echo [2/2] Starting React Frontend on :5173...
start "ThreadIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services starting!
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:4000
echo.
echo Close the two terminal windows to stop services.
pause
