@echo off
echo 🚀 Starting V K Shipping Services Platform...

REM Start backend
echo 🔧 Starting Backend...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your email credentials
)

start /B uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM Start frontend
echo 🎨 Starting Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

start /B npm start

echo ✅ Platform is starting up...
echo 🌐 Public Website: http://localhost:3000
echo 🔐 Admin Panel: http://localhost:3000/admin
echo 📚 API Documentation: http://localhost:8000/docs
echo.
echo Press any key to stop...
pause
