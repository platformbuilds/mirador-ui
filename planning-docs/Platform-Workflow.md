# Impact Detection Workflow
## Step 1: Business Impact Detection from Transaction Logs
```yaml
Transaction Success Rate Analysis Interface:
├── 📊 Business Impact Discovery Dashboard:
│   ├── Real-Time Success Rate Monitor:
│   │   ├── API Call: POST /api/v1/logs/query
│   │   ├── LogsQL Query: 
│   │   │   "_time:15m | stats by (orgId) 
│   │   │    count() as total_transactions,
│   │   │    count() if (status='SUCCESS') as successful_transactions |
│   │   │    math (successful_transactions * 100.0) / total_transactions as success_rate"
│   │   ├── Display Format:
│   │   │   ├── SBI (orgId: 001): 97.2% ⚠️ (-2.8% from target)
│   │   │   ├── HDFC (orgId: 002): 99.1% ✅ (Within SLA)
│   │   │   ├── ICICI (orgId: 003): 94.5% 🚨 (-5.0% CRITICAL)
│   │   │   ├── Axis (orgId: 004): 98.8% ⚠️ (-0.7% from target)
│   │   │   └── Overall System: 97.4% 🚨 (-2.1% from target)
│   │   └── Auto-refresh: Every 30 seconds
│   ├── Trend Analysis Engine:
│   │   ├── API Call: POST /api/v1/logs/query
│   │   ├── LogsQL Query:
│   │   │   "_time:4h | stats by (orgId, _time:5m)
│   │   │    count() as total,
│   │   │    count() if (status='SUCCESS') as success |
│   │   │    math (success * 100.0) / total as success_rate"
│   │   ├── Trend Detection Logic:
│   │   │   ├── Identify banks with >1% drop in 5-minute window
│   │   │   ├── Flag banks with <98% success rate
│   │   │   ├── Calculate rate of decline per bank
│   │   │   └── Predict impact severity if trend continues
│   │   └── Alert Triggering:
│   │       ├── Critical: Success rate <95% for any bank
│   │       ├── Warning: Success rate <98% for any bank
│   │       ├── Trend Alert: >2% decline in 10 minutes
│   │       └── System Alert: Overall success <99%
│   ├── Error Pattern Analysis:
│   │   ├── API Call: POST /api/v1/logs/query
│   │   ├── LogsQL Query:
│   │   │   "_time:1h status!=SUCCESS | 
│   │   │    stats by (orgId, errorCode) count() as error_count |
│   │   │    sort by (error_count desc)"
│   │   ├── Error Classification:
│   │   │   ├── TIMEOUT: Network/processing delays
│   │   │   ├── DB_ERROR: Database connectivity/performance
│   │   │   ├── SYSTEM_ERROR: Application/infrastructure issues
│   │   │   ├── VALIDATION_ERROR: Business rule failures
│   │   │   └── NETWORK_ERROR: Network connectivity issues
│   │   └── Bank-Specific Error Patterns:
│   │       ├── ICICI: 70% TIMEOUT, 25% SYSTEM_ERROR
│   │       ├── SBI: 45% TIMEOUT, 30% DB_ERROR
│   │       ├── HDFC: 60% NETWORK_ERROR (minor)
│   │       └── Axis: 50% PROCESSING_DELAY
│   └── Processing Time Impact Analysis:
│       ├── API Call: POST /api/v1/logs/query
│       ├── LogsQL Query:
│       │   "_time:1h | stats by (orgId, _time:5m)
│       │    avg(processingTime) as avg_processing_time,
│       │    quantile(0.95, processingTime) as p95_processing_time"
│       ├── SLA Comparison:
│       │   ├── Target: <2000ms average processing time
│       │   ├── ICICI: 3200ms (60% above SLA)
│       │   ├── SBI: 2800ms (40% above SLA)
│       │   ├── HDFC: 1800ms (Within SLA)
│       │   └── Axis: 2300ms (15% above SLA)
│       └── Processing Time Trend:
│           ├── Show 4-hour trend per bank
│           ├── Correlate with success rate drops
│           ├── Identify processing bottlenecks
│           └── Flag timeout threshold breaches
```

## Step 2: Affected Bank Identification
```yaml
Bank Impact Prioritization:
├── 🎯 Severity-Based Bank Ranking:
│   ├── Critical Impact Banks (Success Rate <95%):
│   │   ├── ICICI: 94.5% success rate
│   │   │   ├── Failed Transactions: 5,230 in last hour
│   │   │   ├── Revenue Impact: ₹4.2 Cr estimated loss
│   │   │   ├── Error Pattern: 70% timeouts, 25% system errors
│   │   │   └── Trend: Declining since 14:23 (sharp drop)
│   │   └── Investigation Priority: #1 - Immediate action required
│   ├── Warning Level Banks (95% ≤ Success Rate < 98%):
│   │   ├── SBI: 97.2% success rate
│   │   │   ├── Failed Transactions: 3,240 in last hour
│   │   │   ├── Revenue Impact: ₹2.8 Cr estimated loss
│   │   │   ├── Error Pattern: 45% timeouts, 30% DB errors
│   │   │   └── Trend: Gradual decline since 14:20
│   │   ├── Axis: 98.8% success rate
│   │   │   ├── Failed Transactions: 1,120 in last hour
│   │   │   ├── Revenue Impact: ₹0.9 Cr estimated loss
│   │   │   ├── Error Pattern: 50% processing delays
│   │   │   └── Trend: Minor decline since 14:28
│   │   └── Investigation Priority: #2 - Monitor and prepare action
│   └── Stable Banks (Success Rate ≥ 98%):
│       ├── HDFC: 99.1% success rate
│       │   ├── Failed Transactions: 890 in last hour
│       │   ├── Revenue Impact: ₹0.3 Cr (normal variance)
│       │   ├── Error Pattern: 60% minor network errors
│       │   └── Trend: Stable performance
│       └── Investigation Priority: #3 - Baseline for comparison
├── 📊 Bank Impact Timeline:
│   ├── T-300s: All banks performing normally (>99% success)
│   ├── T-180s: ICICI shows first signs of decline (99.2%)
│   ├── T-120s: ICICI drops to 97.5%, SBI starts declining (98.8%)
│   ├── T-60s: ICICI critical at 95.2%, SBI warning at 97.5%
│   ├── T-30s: ICICI critical at 94.5%, SBI at 97.2%, Axis shows decline
│   ├── T-0s: Current state - Multi-bank impact confirmed
│   └── Investigation Focus: Start with ICICI (worst impact), correlate with SBI
└── 🔍 Correlation Investigation Strategy:
    ├── Primary Investigation: ICICI Bank (most severe impact)
    ├── Secondary Investigation: SBI Bank (secondary impact)
    ├── Comparative Analysis: Why HDFC remained stable
    ├── Pattern Analysis: Common technical factors across affected banks
    └── Timeline Focus: 15-minute window around T-180s to T-0s
```

# 🔗 Technical Causation Discovery
## Step 3: Infrastructure Metrics Correlation
```yaml
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
## Step 4: Application Performance Correlation
```yaml
Application Layer Investigation:
├── 🔧 Kafka Performance Analysis:
│   ├── Metric Discovery:
│   │   ├── API Call: GET /api/v1/labels
│   │   ├── Kafka Metrics Filter:
│   │   │   ├── kafka_consumer_lag_total
│   │   │   ├── kafka_broker_messages_in_rate
│   │   │   ├── kafka_request_handler_avg_idle_percent
│   │   │   └── kafka_network_request_rate
│   ├── Consumer Lag Analysis:
│   │   ├── API Call: GET /api/v1/query_range
│   │   ├── PromQL Query: "kafka_consumer_lag_total{topic='payment-transactions'}"
│   │   ├── Lag Timeline Correlation:
│   │   │   ├── T-180s: Consumer lag normal at <100 messages
│   │   │   ├── T-120s: Lag increases to 5,000 messages
│   │   │   ├── T-90s: Lag spikes to 25,000 messages
│   │   │   ├── T-60s: Lag critical at 50,000 messages
│   │   │   └── Correlation: Lag buildup 60s before transaction failures
│   │   └── Impact Analysis:
│   │       ├── Transaction processing delays
│   │       ├── Bank-specific topic lag correlation
│   │       ├── Consumer group rebalancing issues
│   │       └── Message processing bottlenecks
├── 💾 Cassandra Performance Analysis:
│   ├── Database Metrics Discovery:
│   │   ├── API Call: GET /api/v1/labels
│   │   ├── Cassandra Metrics:
│   │   │   ├── cassandra_read_latency_seconds
│   │   │   ├── cassandra_write_latency_seconds
│   │   │   ├── cassandra_pending_compactions
│   │   │   └── cassandra_active_connections
│   ├── Read Latency Correlation:
│   │   ├── API Call: GET /api/v1/query_range
│   │   ├── PromQL Query: "cassandra_read_latency_seconds{quantile='0.95'}"
│   │   ├── Latency Timeline:
│   │   │   ├── T-150s: Read latency normal at 5ms P95
│   │   │   ├── T-120s: Latency increases to 25ms P95
│   │   │   ├── T-90s: Latency spikes to 100ms P95
│   │   │   ├── T-60s: Latency critical at 200ms P95
│   │   │   └── Correlation: DB latency spike correlates with transaction timeouts
│   │   └── Database Impact Analysis:
│   │       ├── Connection pool exhaustion
│   │       ├── Query timeout increases
│   │       ├── Compaction operation interference
│   │       └── Replication lag impact
├── ⚡ Redis Cache Performance Analysis:
│   ├── Cache Metrics Discovery:
│   │   ├── API Call: GET /api/v1/labels
│   │   ├── Redis Metrics:
│   │   │   ├── redis_connected_clients
│   │   │   ├── redis_memory_used_bytes
│   │   │   ├── redis_keyspace_hits_total
│   │   │   └── redis_commands_processed_total
│   ├── Cache Hit Rate Analysis:
│   │   ├── API Call: GET /api/v1/query_range
│   │   ├── PromQL Query: "rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) * 100"
│   │   ├── Hit Rate Timeline:
│   │   │   ├── T-180s: Hit rate normal at 95%
│   │   │   ├── T-120s: Hit rate drops to 85%
│   │   │   ├── T-90s: Hit rate drops to 70%
│   │   │   ├── T-60s: Hit rate critical at 65%
│   │   │   └── Correlation: Cache miss spike forces database load
│   │   └── Cache Impact Analysis:
│   │       ├── Memory eviction patterns
│   │       ├── Connection pool saturation
│   │       ├── Key expiration policy effects
│   │       └── Database load increase correlation
└── 📊 JVM Performance Analysis:
    ├── JVM Metrics Discovery:
    │   ├── API Call: GET /api/v1/labels
    │   ├── JVM Metrics:
    │   │   ├── jvm_memory_used_bytes
    │   │   ├── jvm_gc_collection_seconds
    │   │   ├── jvm_threads_current
    │   │   └── jvm_classes_loaded
    ├── Garbage Collection Impact:
    │   ├── API Call: GET /api/v1/query_range
    │   ├── PromQL Query: "rate(jvm_gc_collection_seconds_total[5m])"
    │   ├── GC Timeline Correlation:
    │   │   ├── T-150s: GC normal at 100ms/minute
    │   │   ├── T-120s: GC increases to 500ms/minute
    │   │   ├── T-90s: GC spikes to 2000ms/minute
    │   │   ├── T-60s: GC critical at 5000ms/minute (5s pauses)
    │   │   └── Correlation: GC pause spikes correlate with transaction timeouts
    └── Thread Pool Analysis:
        ├── Thread pool utilization metrics
        ├── Queue depth measurements
        ├── Thread starvation detection
        └── Request rejection correlation
```
## Step 5: Trace-Based Root Cause Analysis
```yaml
OpenTelemetry Trace Investigation:
├── 🗺️ Service Discovery & Analysis:
│   ├── Service Identification:
│   │   ├── API Call: GET /api/v1/traces/services
│   │   ├── Key Services Discovered:
│   │   │   ├── payment-service
│   │   │   ├── auth-service
│   │   │   ├── validation-service
│   │   │   ├── database-service
│   │   │   └── notification-service
│   ├── Operation Analysis per Service:
│   │   ├── API Call: GET /api/v1/traces/services/payment-service/operations
│   │   ├── Critical Operations:
│   │   │   ├── processPayment
│   │   │   ├── validateTransaction
│   │   │   ├── checkBalance
│   │   │   ├── updateAccount
│   │   │   └── sendNotification
│   └── Service Performance Baseline:
│       ├── Normal operation latency baselines
│       ├── Error rate historical patterns
│       ├── Throughput capacity measurements
│       └── Dependency relationship mapping
├── 🔍 Trace Search & Analysis:
│   ├── Problematic Trace Discovery:
│   │   ├── API Call: POST /api/v1/traces/search
│   │   ├── Search Parameters:
│   │   │   ├── service: payment-service
│   │   │   ├── operation: processPayment
│   │   │   ├── minDuration: 3000ms (timeout threshold)
│   │   │   ├── start: T-180s (investigation window start)
│   │   │   ├── end: T-0s (current time)
│   │   │   ├── tags: {"orgId": "003"} (ICICI transactions)
│   │   │   └── limit: 100 (sample size)
│   ├── Slow Transaction Analysis:
│   │   ├── Sample Slow Trace Analysis:
│   │   │   ├── Total Duration: 3,800ms (vs normal 800ms)
│   │   │   ├── Database Query Time: 1,200ms (vs normal 50ms)
│   │   │   ├── Cache Lookup Time: 300ms (vs normal 10ms)
│   │   │   ├── External API Call: 800ms (vs normal 200ms)
│   │   │   ├── Authentication: 150ms (vs normal 30ms)
│   │   │   └── Processing Logic: 1,350ms (vs normal 510ms)
│   │   ├── Bottleneck Identification:
│   │   │   ├── Primary Bottleneck: Database queries (32% of total time)
│   │   │   ├── Secondary Bottleneck: Processing logic (36% of total time)
│   │   │   ├── External Dependencies: Bank API calls (21% of total time)
│   │   │   └── Infrastructure: Cache misses contributing (8% of total time)
│   │   └── Error Trace Analysis:
│   │       ├── Timeout errors in database spans
│   │       ├── Connection pool exhaustion errors
│   │       ├── Circuit breaker activation traces
│   │       └── Retry attempt pattern analysis
├── 📊 Cross-Service Impact Analysis:
│   ├── Service Dependency Performance:
│   │   ├── payment-service → database-service: 1,200ms (vs normal 50ms)
│   │   ├── payment-service → auth-service: 150ms (vs normal 30ms)
│   │   ├── payment-service → validation-service: 200ms (vs normal 40ms)
│   │   └── External API calls: 800ms (vs normal 200ms)
│   ├── Error Propagation Mapping:
│   │   ├── Database timeout → Payment service timeout
│   │   ├── Cache miss → Database overload → Cascading failures
│   │   ├── Memory pressure → GC pauses → Request queuing
│   │   └── Infrastructure resource exhaustion → Multi-service impact
│   └── Critical Path Analysis:
│       ├── Identify longest execution paths
│       ├── Map resource contention points
│       ├── Trace error propagation chains
│       └── Measure recovery time patterns
└── 🎯 Root Cause Synthesis:
    ├── Primary Root Cause: Infrastructure resource exhaustion (CPU/Memory)
    ├── Propagation Path: Infrastructure → Database performance → Application timeouts → Transaction failures
    ├── Amplifying Factors: Cache performance degradation, GC pressure, connection pool exhaustion
    ├── Bank-Specific Impact: ICICI routing through most affected infrastructure components
    ├── Timeline: Infrastructure issues started T-150s, business impact visible at T-60s
    └── Recovery Strategy: Address infrastructure bottlenecks, optimize database queries, enhance cache efficiency
```
