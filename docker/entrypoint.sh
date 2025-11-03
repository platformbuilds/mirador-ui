#!/bin/sh
# MiradorStack UI - Docker Entrypoint Script
# Handles runtime configuration and environment variable substitution

set -e

# Default values
MIRADOR_CORE_URL=${MIRADOR_CORE_URL:-"http://localhost:8080"}
APP_TITLE=${APP_TITLE:-"MiradorStack Observability"}
APP_VERSION=${APP_VERSION:-"1.0.0"}

echo "🚀 Starting MiradorStack UI..."
echo "📡 Backend URL: $MIRADOR_CORE_URL"
echo "📖 App Title: $APP_TITLE"
echo "🔖 Version: $APP_VERSION"

# Create runtime configuration file
cat > /usr/share/nginx/html/config/config.json << EOF
{
  "api": {
    "baseUrl": "${MIRADOR_CORE_URL}",
    "endpoints": {
      "metrics": "/api/v1/metrics",
      "logs": "/api/v1/logs",
      "traces": "/api/v1/traces",
      "schema": "/api/v1/schema"
    }
  },
  "app": {
    "title": "${APP_TITLE}",
    "version": "${APP_VERSION}",
    "build": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "features": {
    "metrics": true,
    "logs": true,
    "traces": true,
    "alerts": true,
    "dashboards": true
  }
}
EOF

# Substitute environment variables in nginx config
envsubst '$MIRADOR_CORE_URL' < /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

# Validate nginx configuration
nginx -t

echo "✅ MiradorStack UI configuration complete"

# Execute the main container command
exec "$@"