# Mirador UI Monorepo

Production-ready scaffold for Mirador UI: backend (Express + TS), frontend (React + Vite + Tailwind), shared types, Dockerfiles, and Helm chart. This README provides end-to-end setup for local development, container builds, and Kubernetes deployments via Helm.

## Prerequisites
- Node.js 20+
- Docker (optional for local stack)
- MySQL 8 and Valkey/Redis (or use docker-compose)
- Helm 3.x and a Kubernetes cluster (for deploy)

## Install
```sh
# from public/mirador-ui
npm install --workspaces
npm -w @mirador/backend exec prisma generate
```

## Development (local)
```sh
# Start backend and frontend (Vite proxies /api to backend)
npm run dev
```
- Backend: http://localhost:8080 (health: /api/health)
- Frontend: http://localhost:5173

Default dev login: admin@example.com / password (override via AUTH_DEMO_USER/AUTH_DEMO_PASS).

## Configuration (env)
Backend environment variables:
- `NODE_ENV` (development|production)
- `PORT` (default 8080)
- `APP_VERSION` (optional; surfaced in /api/health)
- `CORS_ORIGIN` (e.g., http://localhost:5173 or https://your.domain)
- `JWT_SECRET` (required in production)
- `AUTH_DEMO_USER`, `AUTH_DEMO_PASS` (dev-only demo credentials)
- `DATABASE_URL` (MySQL connection string)
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`
- `MIRADOR_CORE_URL` (base URL of MIRADOR-CORE gateway)
- `RATE_LIMIT_WINDOW_MS` (default 60000), `RATE_LIMIT_MAX` (default 1000)

Frontend variables: none required; built assets are static, Vite dev proxies `/api`.

### Configure MIRADOR-CORE endpoint
- Local/dev (Docker Compose): set `MIRADOR_CORE_URL` under `services.backend.environment` in `docker/docker-compose.dev.yml`.
- Kubernetes (Helm): set `miradorCore.url` in your values file. The chart injects this as `MIRADOR_CORE_URL` for the backend.
  - Same namespace example: `http://mirador-core:9000`
  - Cross-namespace example: `http://mirador-core.<namespace>.svc.cluster.local:9000`
- Code reference: the backend client reads this from env and defaults to `http://localhost:9000`.
  - `packages/backend/src/services/MiradorApiService.ts`

## Run Locally with Docker Compose
```sh
cd docker
docker compose -f docker-compose.dev.yml up --build
```
Services:
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- MySQL: localhost:3306
- Valkey/Redis: localhost:6379

## Build Container Images
From `public/mirador-ui`:
```sh
# Backend image
docker build -f docker/backend.Dockerfile -t ghcr.io/yourorg/mirador-backend:0.1.0 .

# Frontend image
docker build -f docker/frontend.Dockerfile -t ghcr.io/yourorg/mirador-frontend:0.1.0 .

# (Optional) Push to registry
docker push ghcr.io/yourorg/mirador-backend:0.1.0
docker push ghcr.io/yourorg/mirador-frontend:0.1.0
```

## Kubernetes Deployments (Helm)
Chart: `deployments/helm/mirador-ui`

1) Create namespace and secrets
```sh
kubectl apply -f deployments/k8s/namespace.yaml

# Database URL and (optional) MySQL root password for backup CronJob
kubectl -n mirador-dev create secret generic mirador-secrets \
  --from-literal=DATABASE_URL='mysql://user:pass@mysql:3306/mirador' \
  --from-literal=MYSQL_ROOT_PASSWORD='replace-me'
```

2) Configure images/ingress via values files
- Dev: `deployments/helm/mirador-ui/values-dev.yaml`
- Prod: `deployments/helm/mirador-ui/values-prod.yaml`

3) Deploy
```sh
# Dev
helm upgrade --install mirador-ui deployments/helm/mirador-ui \
  -n mirador-dev -f deployments/helm/mirador-ui/values-dev.yaml

# Prod
helm upgrade --install mirador-ui deployments/helm/mirador-ui \
  -n your-namespace -f deployments/helm/mirador-ui/values-prod.yaml
```

Notes:
- A pre-install/upgrade Job runs `prisma migrate deploy`.
- Backend Service includes Prometheus scrape annotations for `/api/metrics`.
- Ingress routes `/` to frontend and `/api` to backend; enable TLS per your ingress controller.

## Health, Readiness, Metrics
- `GET /api/health` – liveness probe
- `GET /api/ready` – readiness probe (Redis/MySQL checks)
- `GET /api/metrics` – Prometheus metrics
- API docs at `/api/docs`

## Troubleshooting & Guides
- User Guide: `docs/user-guide.md`
- Deployment Guide: `docs/deployment-guide.md`
- Troubleshooting: `docs/troubleshooting.md`
- Training: `docs/training.md`

## Notes
- Prisma schema is defined; regenerate client after dependency install.
- Redis is optional in dev; caching degrades gracefully if unavailable.
- Security hardening in backend: helmet (CSP in prod), rate limiting, compression, structured logs (pino).
