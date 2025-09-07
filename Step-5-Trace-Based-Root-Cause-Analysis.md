```
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
