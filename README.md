# Mirador UI Monorepo

Production-ready scaffold for Mirador UI: backend (Express + TS), frontend (React + Vite + Tailwind), shared types, Dockerfiles, and Helm chart.

## Prerequisites
- Node.js 20+
- Docker (optional for local stack)
- MySQL 8 and Valkey/Redis (or use docker-compose)

## Install
```sh
# from public/mirador-ui
npm install --workspaces
```

## Development
```sh
# Start backend and frontend (with Vite proxy to /api)
npm run dev
```
Backend runs on :8080, frontend on :5173.

## Docker (dev stack)
```sh
# Build and run MySQL, Valkey, backend, frontend
cd docker
docker compose -f docker-compose.dev.yml up --build
```

## Environment
Backend env vars:
- `PORT` (default 8080)
- `CORS_ORIGIN` (default *)
- `DATABASE_URL` (MySQL connection string)
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`
- `RATE_LIMIT_WINDOW_MS` (default 60000), `RATE_LIMIT_MAX` (default 1000)

## Helm
Basic chart under `deployments/helm/mirador-ui`. Set images in `values.yaml`, then:
```sh
helm upgrade --install mirador-ui deployments/helm/mirador-ui -n your-namespace
```

## Endpoints
- `GET /health` – JSON health/status
- `GET /metrics` – Prometheus metrics
- Docs at `/api/docs` (basic OpenAPI stub)

## Notes
- Prisma schema is defined; run `npx prisma generate` after installing deps.
- Cache service uses ioredis; safe to run without Redis (connect logs error but app serves).
- Production hardening: helmet, rate limiting, compression, structured logging (pino).
