#!/bin/sh
set -e

echo "🚀 Starting Mirador UI unified container..."

# Start mock API in background
echo "📡 Starting mock API server..."
cd /app
NODE_ENV=development MOCK_PORT=3001 node mock/server.js &
API_PID=$!

# Wait for API to start
echo "⏱️  Waiting for API to initialize..."
sleep 3

# Start nginx in foreground
echo "🌐 Starting nginx web server..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Function to handle shutdown gracefully
shutdown() {
    echo "🛑 Shutting down services..."
    kill $API_PID 2>/dev/null || true
    kill $NGINX_PID 2>/dev/null || true
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown SIGTERM SIGINT

echo "✅ All services started successfully!"
echo "🌐 Frontend available at http://localhost:80"
echo "📡 API available at http://localhost:80/api"

# Wait for nginx (main process)
wait $NGINX_PID