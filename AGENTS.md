# AGENTS.md

## Local Testing with Docker

All local testing must be performed using Docker containers to ensure consistency with production environments and to avoid "works on my machine" issues.

### Prerequisites

- Docker Desktop or Rancher Desktop installed and running
- Docker Compose V2
- pnpm (for package management)

### Development Setup

For local development with hot reload:

```bash
pnpm compose:up:dev
```

This starts the development container with:
- Hot reload enabled
- Volume mounting for source code changes
- Development server on port 3000

### Production Testing

To test the production build locally:

```bash
pnpm compose:up
```

This runs the optimized production container with:
- Multi-stage Alpine Linux build
- Nginx serving static files
- Security hardening
- Health checks

### Manual Docker Commands

If you need to build and run manually:

```bash
# Build the image
docker build -t mirador-ui:latest .

# Run production container
docker run -d --name mirador-ui -p 3000:80 mirador-ui:latest

# Run development container
docker run -d --name mirador-ui-dev -p 3000:5173 -v $(pwd):/app mirador-ui:dev
```

### Health Checks

Test the application health:

```bash
curl http://localhost:3000/health
```

Should return: `healthy`

### Cleanup

```bash
# Stop and remove containers
docker stop mirador-ui && docker rm mirador-ui
docker stop mirador-ui-dev && docker rm mirador-ui-dev

# Or use docker-compose
pnpm compose:down
```

### Best Practices

1. Always test both development and production builds
2. Use Docker for all local testing scenarios
3. Verify health checks pass
4. Test the full application flow in containers
5. Clean up containers after testing