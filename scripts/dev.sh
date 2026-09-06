#!/usr/bin/env bash
# ==============================================================================
# Zenvora Local Development Runner
# ==============================================================================
set -e

echo "Starting Zenvora in Native Local Development Mode..."

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Launching Backend API and Frontend..."
(cd backend && npm run dev) &
BACKEND_PID=$!

(cd frontend && npm run dev) &
FRONTEND_PID=$!

cleanup() {
  echo "Shutting down Zenvora services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM
wait
