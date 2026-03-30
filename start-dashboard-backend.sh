#!/bin/bash

# ============================================
# TITANIO DASHBOARD BACKEND — PRODUCTION START
# Port: 4444
# Real model switching via OpenClaw CLI
# ============================================

set -e

BACKEND_DIR="/tmp/titanio-dashboard-backend"
BACKEND_CODE="/tmp/titanio-dashboard-backend.js"
PORT=4444

echo "🚀 Starting Titanio Dashboard Backend (REAL MODEL SWITCHING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any existing instance
pkill -f "node.*titanio-dashboard-backend" 2>/dev/null || true
sleep 1

# Ensure /tmp/node_modules exists
if [ ! -d "/tmp/node_modules" ]; then
  echo "📦 Installing dependencies..."
  cd /tmp
  npm install express cors --silent 2>/dev/null || npm install express cors 2>&1 | grep -v "^npm"
fi

# Start the backend
echo "🔧 Starting backend on port $PORT..."
cd /tmp && node titanio-dashboard-backend.js > /tmp/dashboard-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for startup
sleep 2

# Verify it's running
if curl -s http://localhost:$PORT/health | grep -q "ok"; then
  echo "✅ Backend is running (PID: $BACKEND_PID)"
  echo "📡 API endpoints:"
  echo "   GET  http://localhost:$PORT/api/openclaw/model"
  echo "   POST http://localhost:$PORT/api/openclaw/model"
  echo "   GET  http://localhost:$PORT/api/openclaw/models"
  echo "   GET  http://localhost:$PORT/health"
  echo ""
  echo "🧪 Test model switching:"
  echo "   curl -X POST http://localhost:$PORT/api/openclaw/model \\"
  echo "     -H 'Content-Type: application/json' \\"
  echo "     -d '{\"model\":\"sonnet\"}'"
  echo ""
  echo "💾 Logs: tail -f /tmp/dashboard-backend.log"
else
  echo "❌ Backend failed to start. Check logs:"
  tail -20 /tmp/dashboard-backend.log
  exit 1
fi

# Keep process in background
wait $BACKEND_PID
