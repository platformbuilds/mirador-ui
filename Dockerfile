# MiradorStack UI Dockerfile
# Multi-stage build for production optimization

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build arguments for configuration
ARG VITE_MIRADOR_CORE_URL=http://localhost:8080
ARG VITE_APP_TITLE="MiradorStack Observability"
ARG VITE_APP_VERSION=1.0.0

# Set environment variables for build
ENV VITE_MIRADOR_CORE_URL=${VITE_MIRADOR_CORE_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

# Build the application
RUN npm run build-only

# Stage 2: Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for runtime configuration
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create directory for runtime config
RUN mkdir -p /usr/share/nginx/html/config

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Use entrypoint script for runtime configuration
ENTRYPOINT ["/entrypoint.sh"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]