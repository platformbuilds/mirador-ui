# Deployment & Operations Guide

## Environments
- Use `values-dev.yaml` and `values-prod.yaml` under `deployments/helm/mirador-ui`.

## Deploy
```
helm upgrade --install mirador-ui deployments/helm/mirador-ui -n <ns> -f deployments/helm/mirador-ui/values-prod.yaml
```

## Migrations
- A Helm pre-install/upgrade Job runs `prisma migrate deploy`.

## Backups
- A CronJob template performs nightly MySQL dumps; wire storage and secrets as needed.

## Health & Metrics
- Liveness: `/api/health`, Readiness: `/api/ready`, Metrics: `/api/metrics`.
- Prometheus scrape annotations are on the backend Service.

## Incidents
- Check readiness, logs, and metrics histograms. Rollback with `helm rollback`.

