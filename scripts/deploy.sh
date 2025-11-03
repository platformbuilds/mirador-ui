#!/bin/bash
# MiradorStack UI - Production Deployment Script
# Deploys MiradorStack UI to production environment

set -e

# Configuration
ENVIRONMENT=${1:-"production"}
MIRADOR_CORE_URL=${MIRADOR_CORE_URL:-"http://mirador-core:8080"}
CONTAINER_PORT=${CONTAINER_PORT:-"3000"}
HOST_PORT=${HOST_PORT:-"3000"}

echo "🚀 Deploying MiradorStack UI to $ENVIRONMENT"
echo "📡 Backend URL: $MIRADOR_CORE_URL"
echo "🌐 Port mapping: $HOST_PORT -> $CONTAINER_PORT"

# Stop existing container if running
if docker ps -q --filter "name=miradorstack-ui" | grep -q .; then
  echo "🛑 Stopping existing container..."
  docker stop miradorstack-ui || true
  docker rm miradorstack-ui || true
fi

# Pull latest image or build if not available
if docker images -q miradorstack-ui:latest | grep -q .; then
  echo "📦 Using existing image: miradorstack-ui:latest"
else
  echo "🏗️  Building image..."
  ./scripts/build-docker.sh latest
fi

# Deploy container
echo "🚀 Starting production container..."
docker run -d \
  --name miradorstack-ui \
  --restart unless-stopped \
  -p "$HOST_PORT:80" \
  -e MIRADOR_CORE_URL="$MIRADOR_CORE_URL" \
  -e APP_TITLE="MiradorStack Observability" \
  -e APP_VERSION="1.0.0" \
  miradorstack-ui:latest

# Wait for container to be healthy
echo "⏳ Waiting for health check..."
sleep 10

# Verify deployment
if docker ps --filter "name=miradorstack-ui" --filter "status=running" | grep -q miradorstack-ui; then
  echo "✅ Deployment successful!"
  echo "🌐 MiradorStack UI is available at: http://localhost:$HOST_PORT"
  echo "💊 Health check: http://localhost:$HOST_PORT/health"
  echo "📋 View logs: docker logs -f miradorstack-ui"
  echo "🛑 Stop: docker stop miradorstack-ui"
else
  echo "❌ Deployment failed!"
  echo "📋 Check logs: docker logs miradorstack-ui"
  exit 1
fi