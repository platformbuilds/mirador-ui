# Troubleshooting

- Backend not ready: check `/api/ready` and Redis/MySQL connectivity.
- 5xx spikes: inspect `http_request_duration_seconds` and error counters.
- CORS issues: verify `CORS_ORIGIN` env and ingress config.
- JWT failures: ensure `JWT_SECRET` and correct credentials in env.
- Socket disconnects: tune pingInterval/pingTimeout; check load balancer idle timeouts.
