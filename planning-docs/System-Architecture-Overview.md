```
mirador-ui Architecture:
├── Frontend Layer (React + TypeScript + D3.js):
│   ├── Dashboard Builder Interface
│   ├── Timeline Correlation Visualizer
│   ├── Real-time Data Visualization
│   ├── Self-Service Configuration Tools
│   └── Mobile-Responsive Interface
├── API Layer (Node.js/Express):
│   ├── MIRADOR-CORE API Proxy
│   ├── Dashboard Configuration API
│   ├── User Session Management
│   ├── WebSocket Real-time Streaming
│   └── Authentication & Authorization
├── Data Layer:
│   ├── MySQL: Dashboard configurations, user preferences
│   ├── Valkey: Real-time caching, session storage
│   ├── MIRADOR-CORE: Source of truth for metrics/logs/traces
│   └── File Storage: Dashboard templates, exports
└── Infrastructure Layer:
    ├── HAProxy: Load balancing and SSL termination
    ├── Kubernetes: Container orchestration
    ├── Helm Charts: Deployment management
    └── Monitoring: Prometheus + Grafana for platform health
```
