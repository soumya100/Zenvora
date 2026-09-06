#!/usr/bin/env bash
# ==============================================================================
# Zenvora Quickstart Setup Script for Linux VPS
# ==============================================================================
set -euo pipefail

echo "========================================================"
echo "🛡️  Initializing Zenvora Privacy Search Stack"
echo "========================================================"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose plugin first."
    echo "See docs/deployment.md for installation instructions."
    exit 1
fi

if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    RANDOM_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    sed -i "s/change_this_to_a_random_32_character_hex_secret_in_production/${RANDOM_SECRET}/" .env
    echo "🔑 Generated random SearXNG secret key in .env"
fi

echo "🚀 Building and starting Zenvora containers..."
docker compose up -d --build

echo "========================================================"
echo "✅ Zenvora is running!"
echo "Check health: curl http://localhost/health"
echo "View logs:    docker compose logs -f"
echo "========================================================"
