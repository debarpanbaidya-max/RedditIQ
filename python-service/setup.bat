@echo off
echo ================================================
echo  ThreadIQ Python Toxicity Microservice Setup
echo ================================================
echo.
echo Installing Python dependencies...
echo This may take a few minutes (torch is large ~800MB)
echo.

pip install -r requirements.txt

echo.
echo ✅ Setup complete!
echo.
echo To start the microservice, run:
echo    python app.py
echo.
pause
