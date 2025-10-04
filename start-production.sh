#!/bin/bash

echo "🔨 Building Next.js application..."
(cd packages/web && npm run build)

echo "🚀 Starting production server..."
(cd server && NODE_ENV=production node index.js) &
SERVER_PID=$!

(cd packages/web && npm run start) &
WEB_PID=$!

echo "✅ Production servers started!"
echo "   Backend: http://localhost:5004 (PID: $SERVER_PID)"
echo "   Frontend: http://localhost:3001 (PID: $WEB_PID)"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for interrupt
trap "kill $SERVER_PID $WEB_PID; exit" INT
wait
