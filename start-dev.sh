#!/bin/bash

# Complete Startup Script for Shipping Website
# This script starts both backend and frontend servers

set -e  # Exit on any error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "
╔════════════════════════════════════════════════════════════╗
║       V K SHIPPING SERVICES - Development Startup          ║
╚════════════════════════════════════════════════════════════╝
"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}[WARNING]${NC} Virtual environment not found. Creating one..."
    python3 -m venv .venv
fi

# Activate venv
echo -e "${YELLOW}[SETUP]${NC} Activating Python virtual environment..."
source .venv/bin/activate

# Install backend dependencies
echo -e "${YELLOW}[SETUP]${NC} Checking backend dependencies..."
pip install -q -r backend/requirements.txt

# Install frontend dependencies
echo -e "${YELLOW}[SETUP]${NC} Checking frontend dependencies..."
cd frontend
npm install -q  2>/dev/null || npm install
cd ..

# Check MongoDB
echo -e "${YELLOW}[CHECK]${NC} Checking MongoDB connection..."
python3 << 'EOF'
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("\033[92m✓ MongoDB is accessible\033[0m")
except Exception as e:
    print(f"\033[91m✗ MongoDB connection failed: {e}\033[0m")
    print("\033[93mMake sure MongoDB is running:\033[0m")
    print("  mongod  (local)")
    print("  OR update MONGO_URI in .env file for MongoDB Atlas")
    exit(1)
EOF

if [ $? -ne 0 ]; then
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Backend will start on:${NC}  http://localhost:8000"
echo -e "  ${GREEN}Frontend will start on:${NC}  http://localhost:3000"
echo -e "  ${GREEN}Admin login route:${NC}      http://localhost:3000/admin"
echo -e "  ${GREEN}Admin password:${NC}         dev19patel"
echo "════════════════════════════════════════════════════════════"
echo ""

# Start backend in background
echo -e "${YELLOW}[BACKEND]${NC} Starting backend server..."
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend
echo -e "${YELLOW}[FRONTEND]${NC} Starting frontend development server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓ Frontend starting (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}✓ Both servers are running!${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "Press Ctrl+C to stop all servers"
echo "════════════════════════════════════════════════════════════"
echo ""

# Function to cleanup on Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}[CLEANUP]${NC} Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    deactivate 2>/dev/null || true
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
