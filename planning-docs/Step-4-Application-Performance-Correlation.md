```
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
