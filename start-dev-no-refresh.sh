#!/bin/bash

echo "🛑 Stopping all existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
sleep 2

echo "🧹 Clearing Next.js cache..."
(cd packages/web && rm -rf .next)

echo "🚀 Starting backend server..."
(cd server && NODE_ENV=development node index.js) &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🌐 Starting frontend without Fast Refresh..."
(cd packages/web && FAST_REFRESH=false WATCHPACK_POLLING=false NODE_OPTIONS='--max-old-space-size=4096' next dev -p 3001) &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "📌 Frontend: http://localhost:3001"
echo "📌 Backend: http://localhost:5004"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
