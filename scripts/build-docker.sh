#!/bin/bash
# MiradorStack UI - Docker Build Script
# Builds production-ready Docker image with optimizations

set -e

# Configuration
IMAGE_NAME="miradorstack-ui"
IMAGE_TAG=${1:-"latest"}
MIRADOR_CORE_URL=${MIRADOR_CORE_URL:-"http://localhost:8080"}

echo "🏗️  Building MiradorStack UI Docker Image"
echo "📦 Image: $IMAGE_NAME:$IMAGE_TAG"
echo "📡 Backend URL: $MIRADOR_CORE_URL"

# Build the Docker image
docker build \
  --build-arg VITE_MIRADOR_CORE_URL="$MIRADOR_CORE_URL" \
  --build-arg VITE_APP_TITLE="MiradorStack Observability" \
  --build-arg VITE_APP_VERSION="$(npm run version --silent || echo '1.0.0')" \
  --tag "$IMAGE_NAME:$IMAGE_TAG" \
  --tag "$IMAGE_NAME:latest" \
  .

echo "✅ Build complete!"
echo "🚀 Run with: docker run -p 3000:80 $IMAGE_NAME:$IMAGE_TAG"
echo "🐳 Or use docker-compose: docker-compose up miradorstack-ui"

# Optional: Push to registry if DOCKER_REGISTRY is set
if [ ! -z "$DOCKER_REGISTRY" ]; then
  echo "📤 Pushing to registry: $DOCKER_REGISTRY"
  
  docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
  docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_REGISTRY/$IMAGE_NAME:latest"
  
  docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
  docker push "$DOCKER_REGISTRY/$IMAGE_NAME:latest"
  
  echo "✅ Push complete!"
fi