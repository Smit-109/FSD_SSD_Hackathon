#!/bin/bash

echo "Starting Modern E-Library System..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log 2>/dev/null || echo "Please start MongoDB manually"
fi

echo ""
echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

echo ""
echo "Starting Frontend Development Server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================="
echo "   Modern E-Library System Started"
echo "==================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
