```
Infrastructure Root Cause Investigation:
├── 🖥️ System Performance Analysis:
│   ├── Metric Discovery:
│   │   ├── API Call: GET /api/v1/labels
│   │   ├── Filter for Infrastructure Metrics:
│   │   │   ├── node_cpu_seconds_total
│   │   │   ├── node_memory_MemAvailable_bytes
│   │   │   ├── node_disk_io_time_seconds_total
│   │   │   ├── node_network_receive_bytes_total
│   │   │   └── node_load1, node_load5, node_load15
│   │   └── Server Instance Discovery: GET /api/v1/label/instance/values
│   ├── CPU Utilization Analysis:
│   │   ├── API Call: GET /api/v1/query_range
│   │   ├── PromQL Query: "100 - (avg(rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)"
│   │   ├── Time Range: Last 4 hours with 1-minute resolution
│   │   ├── Correlation Analysis:
│   │   │   ├── T-120s: CPU normal at 45%
│   │   │   ├── T-90s: CPU spikes to 78%
│   │   │   ├── T-60s: CPU reaches 95% (critical threshold)
│   │   │   ├── T-30s: CPU sustained at 95%+
│   │   │   └── Correlation: CPU spike 60s before ICICI impact
│   │   └── Server-Specific Analysis:
│   │       ├── payment-server-01: 95% CPU (most affected)
│   │       ├── payment-server-02: 89% CPU
│   │       ├── payment-server-03: 92% CPU
│   │       └── Load Balancer Impact: Uneven distribution detected
│   ├── Memory Pressure Analysis:
│   │   ├── API Call: GET /api/v1/query_range
│   │   ├── PromQL Query: "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100"
│   │   ├── Timeline Correlation:
│   │   │   ├── T-150s: Memory normal at 60%
│   │   │   ├── T-120s: Memory increases to 75%
│   │   │   ├── T-90s: Memory pressure at 85%
│   │   │   ├── T-60s: Memory critical at 90%
│   │   │   └── Correlation: Memory pressure preceded CPU spike
│   │   └── Memory Impact Analysis:
│   │       ├── JVM heap pressure detected
│   │       ├── OS page cache pressure
│   │       ├── Swap usage increase
│   │       └── GC frequency increase correlation
│   └── Disk I/O Performance Analysis:
│       ├── API Call: GET /api/v1/query_range
│       ├── PromQL Query: "rate(node_disk_io_time_seconds_total[5m]) * 100"
│       ├── I/O Latency Correlation:
│       │   ├── T-180s: Disk latency normal at 5ms
│       │   ├── T-120s: Latency increases to 25ms
│       │   ├── T-90s: Latency spikes to 50ms
│       │   ├── T-60s: Latency critical at 80ms
│       │   └── Correlation: Disk bottleneck amplified memory pressure
│       └── Storage Impact Assessment:
│           ├── Database write performance degradation
│           ├── Log file write delays
│           ├── Temporary file creation bottlenecks
│           └── JVM garbage collection impact
```
