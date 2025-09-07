```yaml
IMPACT Layer (Business Transaction Logs):
├── Data Source: JSON Transaction Logs
├── API Endpoint: POST /api/v1/logs/query (LogsQL)
├── Key Fields:
│   ├── orgId: Bank identifier (SBI, HDFC, ICICI, etc.)
│   ├── transactionId: Unique transaction identifier
│   ├── status: SUCCESS/FAILURE/TIMEOUT/ERROR
│   ├── timestamp: Transaction processing time
│   ├── processingTime: Transaction duration (ms)
│   ├── errorCode: Specific failure reason
│   ├── amount: Transaction value
│   └── customerSegment: Customer type classification
├── Business Impact Calculations:
│   ├── Success Rate: COUNT(status=SUCCESS) / COUNT(total) per orgId
│   ├── Failure Rate: COUNT(status!=SUCCESS) / COUNT(total) per orgId
│   ├── Processing Time: AVG(processingTime) per orgId
│   └── Error Distribution: COUNT by errorCode per orgId

CAUSATION Layer (Technical Metrics & Traces):
├── Infrastructure Metrics (Prometheus):
│   ├── API Discovery: GET /api/v1/labels
│   ├── Current Values: GET /api/v1/query
│   ├── Time Series: GET /api/v1/query_range
│   ├── Key Metrics:
│   │   ├── node_cpu_seconds_total (CPU utilization)
│   │   ├── node_memory_MemAvailable_bytes (Memory usage)
│   │   ├── node_disk_io_time_seconds_total (Disk I/O)
│   │   ├── kafka_consumer_lag_total (Kafka lag)
│   │   ├── cassandra_read_latency_seconds (DB latency)
│   │   └── redis_connected_clients (Cache connections)
├── Application Traces (OpenTelemetry):
│   ├── Service Discovery: GET /api/v1/traces/services
│   ├── Operation Discovery: GET /api/v1/traces/services/{service}/operations
│   ├── Trace Search: POST /api/v1/traces/search
│   ├── Key Analysis:
│   │   ├── End-to-end transaction latency
│   │   ├── Database operation timing
│   │   ├── Service call performance
│   │   └── Error propagation paths
└── Application Logs (System Events):
    ├── API Endpoint: POST /api/v1/logs/query
    ├── Log Fields Discovery: GET /api/v1/logs/fields
    ├── Key Events:
    │   ├── Application errors and exceptions
    │   ├── Database connection issues
    │   ├── Memory/CPU alerts
    │   └── Service restart events
```