@echo off
echo ================================================
echo  ThreadIQ — Starting All Services
echo ================================================
echo.

echo [1/3] Starting Python Toxicity Microservice on :5001...
start "ThreadIQ Python" cmd /k "cd python-service && python app.py"

timeout /t 3 /noisy >nul

echo [2/3] Starting Node.js Backend on :4000...
start "ThreadIQ Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /noisy >nul

echo [3/3] Starting React Frontend on :5173...
start "ThreadIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services starting!
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:4000
echo    Python:    http://localhost:5001
echo.
echo Close the three terminal windows to stop services.
pause
