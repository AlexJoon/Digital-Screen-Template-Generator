#!/bin/bash

# SlideSpeak Tool - Quick Start Script

echo "======================================"
echo "SlideSpeak Ingestion Tool - Quick Start"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "Starting Backend Server..."
echo ""

# Start backend in background
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

echo "Starting FastAPI server on http://localhost:8000"
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

echo ""
echo "Starting Frontend Server..."
echo ""

# Start frontend
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting Vite dev server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "Application is running!"
echo "======================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
