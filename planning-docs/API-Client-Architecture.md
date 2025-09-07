```yaml
API Integration Layers:
├── Frontend API Client:
│   ├── React Query for data fetching and caching
│   ├── Axios interceptors for error handling
│   ├── Automatic retry logic with exponential backoff
│   ├── Request/response transformation
│   └── TypeScript types for all API responses
├── Backend API Proxy:
│   ├── Centralized MIRADOR-CORE API integration
│   ├── Request aggregation for complex queries
│   ├── Response caching in Valkey
│   ├── Rate limiting and circuit breaker patterns
│   └── Error handling and failover logic
├── Real-time Data Streaming:
│   ├── WebSocket connection to MIRADOR-CORE
│   ├── Real-time metric updates
│   ├── Live transaction log streaming
│   ├── Connection management and reconnection
│   └── Data compression and optimization
└── Caching Strategy:
    ├── Short-term: 30s-5min for real-time metrics
    ├── Medium-term: 5min-1hr for dashboard configs
    ├── Long-term: 1hr-24hr for static metadata
    └── Invalidation: Event-driven cache updates
```
