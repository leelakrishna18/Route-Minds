#!/usr/bin/env bash
# APSRTC Platform All-in-One Startup Script

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting APSRTC Smart Passenger Information Platform"
echo "=========================================================="

# Ensure virtualenv exists
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtualenv..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# Ensure database exists and is seeded
if [ ! -f "backend/apsrtc.db" ]; then
    echo "Seeding database with verified APSRTC Eluru Depot timetable records..."
    PYTHONPATH=backend ./backend/venv/bin/python backend/run.py seed
fi

# Kill any stale Flask processes on port 5001 if existing
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# 1. Start Flask backend on port 5001
echo "Starting Flask API Backend on http://127.0.0.1:5001..."
PYTHONPATH=backend ./backend/venv/bin/python backend/run.py &
BACKEND_PID=$!

trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM EXIT

sleep 2

# 2. Start Vite frontend on port 3000
echo "Starting Vite Frontend on http://localhost:3000..."
cd frontend
npm run dev
