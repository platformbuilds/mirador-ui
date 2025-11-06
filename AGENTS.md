# AGENTS.md

## Local Testing with Docker

All local testing must be performed using Docker containers to ensure consistency with production environments and to avoid "works on my machine" issues.

### Prerequisites

- Docker Desktop or Rancher Desktop installed and running
- Docker Compose V2
- pnpm (for package management)
- `./unified.sh` script (for simplified container management)

### Development Setup

For local development with the unified container:

```bash
./unified.sh
```

This starts the unified container with:
- Frontend application (React/TypeScript with iOS widgets)
- Mock API server (Express.js with KPI data endpoints)
- Nginx reverse proxy serving static files and routing API calls
- Single container deployment with both services
- Health checks and automatic restart

### Production Testing

To test the production build locally:

```bash
./unified.sh
```

The unified container provides production-ready features:
- Multi-stage Alpine Linux build
- Nginx serving static files
- Security hardening
- Built-in health checks
- Optimized for minimal resource usage

### Unified Container Management

Use the `./unified.sh` script for all container operations:

```bash
# Build and start the unified container
./unified.sh

# Build only
./unified.sh build

# Start only (if already built)
./unified.sh up

# View live logs
./unified.sh logs

# Check container status and health
./unified.sh status

# Stop the container
./unified.sh down

# Rebuild from scratch
./unified.sh rebuild

# Clean up container and image
./unified.sh clean
```

### Alternative: pnpm Scripts

You can also use pnpm scripts for unified container management:

```bash
# Build and start
pnpm unified:rebuild

# Start only
pnpm unified:up

# Stop container
pnpm unified:down

# View logs
pnpm unified:logs
```

### Manual Docker Commands (Advanced)

If you need to work with Docker directly:

```bash
# Build the unified image
docker build -f Dockerfile.unified -t mirador-ui:unified .

# Run the unified container
docker run -d --name mirador-unified -p 3000:80 mirador-ui:unified

# View logs
docker logs mirador-unified

# Stop and remove
docker stop mirador-unified && docker rm mirador-unified
```

### Health Checks

Test the application health:

```bash
# Check overall health
curl http://localhost:3000/health

# Test API endpoints
curl http://localhost:3000/api/v1/kpi/defs

# Use the status command
./unified.sh status
```

Should return: `healthy`

### Cleanup

```bash
# Stop and remove unified container
./unified.sh down

# Or clean everything including the image
./unified.sh clean

# Manual cleanup
docker stop mirador-unified && docker rm mirador-unified
docker rmi mirador-ui:unified
```

### Best Practices

1. **Always use `./unified.sh`** for local testing, building, and checking changes
2. Use Docker for all local testing scenarios to ensure consistency
3. Verify health checks pass with `./unified.sh status`
4. Test the full application flow in the unified container
5. Clean up containers after testing with `./unified.sh down`
6. The unified container includes both frontend and mock API - no need for separate services
7. For development changes, use `./unified.sh rebuild` to rebuild and restart
8. Check logs with `./unified.sh logs` for debugging issues