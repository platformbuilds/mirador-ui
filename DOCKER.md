# MiradorStack UI - Docker Guide

## 🐳 Docker Deployment

MiradorStack UI provides multiple Docker deployment options for development and production environments.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+ (optional)
- 2GB+ available RAM
- Node.js 18+ (for development only)

## 🚀 Quick Start

### Production Deployment

```bash
# 1. Build the Docker image
./scripts/build-docker.sh

# 2. Deploy to production
./scripts/deploy.sh

# 3. Access the UI
open http://localhost:3000
```

### Development Environment

```bash
# 1. Set up development environment
./scripts/dev-setup.sh

# 2. Access development server
open http://localhost:3001
```

## 🏗️ Build Options

### Production Build

```bash
# Basic build
docker build -t miradorstack-ui:latest .

# Build with custom backend URL
docker build \
  --build-arg VITE_MIRADOR_CORE_URL="http://your-backend:8080" \
  -t miradorstack-ui:latest .
```

### Development Build

```bash
# Development build with hot reload
docker build -f Dockerfile.dev -t miradorstack-ui:dev .
```

## 🐳 Docker Compose

### Production Stack

```bash
# Start production stack
docker-compose up -d miradorstack-ui

# View logs
docker-compose logs -f miradorstack-ui

# Stop stack
docker-compose down
```

### Development Stack

```bash
# Start development stack with hot reload
docker-compose --profile dev up -d

# Stop development stack
docker-compose --profile dev down
```

### Full Stack with Proxy

```bash
# Start with nginx reverse proxy
docker-compose --profile proxy up -d
```

## ⚙️ Environment Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MIRADOR_CORE_URL` | Backend API URL | `http://localhost:8080` |
| `APP_TITLE` | Application title | `MiradorStack Observability` |
| `APP_VERSION` | Application version | `1.0.0` |
| `CONTAINER_PORT` | Internal container port | `80` |
| `HOST_PORT` | Host port mapping | `3000` |

### Runtime Configuration

The application supports runtime configuration through `/config.json`:

```json
{
  "api": {
    "baseUrl": "http://your-backend:8080",
    "endpoints": {
      "metrics": "/api/v1/metrics",
      "logs": "/api/v1/logs",
      "traces": "/api/v1/traces"
    }
  },
  "features": {
    "metrics": true,
    "logs": true,
    "traces": true
  }
}
```

## 🔍 Health Checks

### Built-in Health Check

```bash
# Check container health
docker exec miradorstack-ui wget --spider http://localhost/health

# View health status
docker ps --filter "name=miradorstack-ui"
```

### Manual Health Check

```bash
# HTTP health check
curl http://localhost:3000/health

# Expected response: "healthy"
```

## 📊 Monitoring

### Container Logs

```bash
# View real-time logs
docker logs -f miradorstack-ui

# View logs from specific time
docker logs --since=1h miradorstack-ui
```

### Resource Usage

```bash
# Monitor container resources
docker stats miradorstack-ui

# Detailed resource usage
docker exec miradorstack-ui ps aux
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Use different port
   docker run -p 3001:80 miradorstack-ui:latest
   ```

2. **Backend connection issues**
   ```bash
   # Check network connectivity
   docker exec miradorstack-ui wget --spider http://mirador-core:8080/health
   
   # Update backend URL
   docker run -e MIRADOR_CORE_URL="http://new-backend:8080" miradorstack-ui:latest
   ```

3. **Build failures**
   ```bash
   # Clean Docker cache
   docker system prune -f
   
   # Rebuild without cache
   docker build --no-cache -t miradorstack-ui:latest .
   ```

### Debug Mode

```bash
# Run with debug information
docker run -e NODE_ENV=development miradorstack-ui:dev

# Interactive container for debugging
docker run -it --entrypoint sh miradorstack-ui:latest
```

## 🚢 Production Deployment

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: miradorstack-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: miradorstack-ui
  template:
    metadata:
      labels:
        app: miradorstack-ui
    spec:
      containers:
      - name: miradorstack-ui
        image: miradorstack-ui:latest
        ports:
        - containerPort: 80
        env:
        - name: MIRADOR_CORE_URL
          value: "http://mirador-core-service:8080"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Docker Swarm

```bash
# Deploy to Docker Swarm
docker stack deploy -c docker-compose.yml miradorstack

# Scale the service
docker service scale miradorstack_miradorstack-ui=3
```

## 🔒 Security

### Security Headers

The nginx configuration includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### HTTPS Configuration

For production HTTPS, mount SSL certificates:

```bash
docker run -v /path/to/ssl:/etc/ssl/certs \
  -p 443:443 \
  miradorstack-ui:latest
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)