```
MIRADOR-CORE API Integration:
├── Business Impact Detection:
│   ├── Transaction Logs: POST /api/v1/logs/query
│   │   ├── Success rate calculations by orgId
│   │   ├── Error pattern analysis
│   │   ├── Processing time analysis
│   │   └── Trend detection queries
│   ├── Log Fields Discovery: GET /api/v1/logs/fields
│   ├── Log Streams: GET /api/v1/logs/streams
│   └── Real-time Log Tail: WebSocket connection
├── Technical Causation Analysis:
│   ├── Metrics Discovery: GET /api/v1/labels
│   ├── Metric Values: GET /api/v1/label/{name}/values
│   ├── Current Metrics: GET /api/v1/query
│   ├── Historical Metrics: GET /api/v1/query_range
│   ├── Time Series Metadata: GET /api/v1/series
│   └── Real-time Metrics: WebSocket streaming
├── Application Performance:
│   ├── Service Discovery: GET /api/v1/traces/services
│   ├── Operations Discovery: GET /api/v1/traces/services/{service}/operations
│   ├── Trace Search: POST /api/v1/traces/search
│   ├── Specific Traces: GET /api/v1/traces/{traceId}
│   └── Span Analysis: Trace detail extraction
└── Configuration & Metadata:
    ├── Data Sources: GET /api/v1/config/datasources
    ├── User Settings: GET/PUT /api/v1/config/user-settings
    ├── Health Check: GET /health
    └── API Documentation: GET /api/openapi.json
```
