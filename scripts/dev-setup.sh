#!/bin/bash
# MiradorStack UI - Development Setup Script
# Sets up local development environment with Docker

set -e

echo "🚀 Setting up MiradorStack UI Development Environment"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cp .env.example .env.local
fi

# Build development image
echo "🏗️  Building development image..."
docker-compose build miradorstack-ui-dev

# Start development environment
echo "🚀 Starting development environment..."
docker-compose --profile dev up -d miradorstack-ui-dev

# Wait for container to be healthy
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if docker-compose ps miradorstack-ui-dev | grep -q "Up"; then
  echo "✅ Development environment is ready!"
  echo "🌐 UI available at: http://localhost:3001"
  echo "📊 Monitoring logs: docker-compose logs -f miradorstack-ui-dev"
  echo "🛑 Stop with: docker-compose --profile dev down"
else
  echo "❌ Failed to start development environment"
  echo "📋 Check logs: docker-compose logs miradorstack-ui-dev"
  exit 1
fi