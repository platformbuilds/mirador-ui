```yaml
Master Timeline Dashboard:
├── 🕐 Chronological Event Correlation (15-minute window):
│   ├── T-180s: 
│   │   ├── Business: All banks >99% success rate (NORMAL)
│   │   ├── Technical: All metrics within normal ranges
│   │   └── Traces: Average response time 800ms
│   ├── T-150s:
│   │   ├── Business: ICICI shows slight decline to 99.2%
│   │   ├── Technical: Memory pressure begins (75% utilization)
│   │   ├── Infrastructure: Disk I/O latency increases to 25ms
│   │   └── Traces: First signs of database query slowdown
│   ├── T-120s:
│   │   ├── Business: ICICI drops to 97.5%, SBI shows decline to 98.8%
│   │   ├── Technical: CPU spikes to 78%, Kafka lag builds to 5K messages
│   │   ├── Database: Cassandra latency increases to 25ms P95
│   │   └── Traces: Payment service response time increases to 1.2s
│   ├── T-90s:
│   │   ├── Business: ICICI critical at 95.2%, SBI warning at 97.5%
│   │   ├── Technical: CPU reaches 95%, Memory at 85%, Disk I/O 50ms
│   │   ├── Application: Redis hit rate drops to 70%, Kafka lag 25K
│   │   ├── Database: Cassandra P95 latency spikes to 100ms
│   │   └── Traces: End-to-end transaction time reaches 2.5s
│   ├── T-60s:
│   │   ├── Business: ICICI critical at 94.8%, SBI at 97.2%, Axis shows decline
│   │   ├── Technical: All infrastructure metrics critical (CPU 95%+, Memory 90%+)
│   │   ├── Application: Massive Kafka lag (50K), Redis hit rate 65%
│   │   ├── Database: Cassandra latency critical at 200ms P95
│   │   ├── JVM: GC pauses spike to 5s, causing application freezes
│   │   └── Traces: Transaction timeouts become frequent (3.8s avg)
│   ├── T-30s:
│   │   ├── Business: Multi-bank impact confirmed, system-wide degradation
│   │   ├── Technical: Infrastructure resource exhaustion
│   │   ├── Application: Circuit breakers activating
│   │   └── Traces: Error rate spike in all service communications
│   └── T-0s (Current):
│       ├── Business: ICICI 94.5%, SBI 97.2%, Axis 98.8%, System 97.4%
│       ├── Technical: Sustained infrastructure pressure
│       ├── Application: Degraded performance across all components
│       └── Recovery Actions: Scaling operations initiated
├── 🔗 Correlation Arrows & Timing:
│   ├── Infrastructure Pressure (T-150s) → Database Performance (T-120s) [30s delay]
│   ├── Database Degradation (T-120s) → Application Slowdown (T-90s) [30s delay]
│   ├── Application Issues (T-90s) → Business Impact (T-60s) [30s delay]
│   ├── Cache Performance (T-120s) → Database Overload (T-90s) [30s delay]
│   └── Combined Factors → Multi-Bank Impact (T-60s to T-0s)
└── 📊 Impact Quantification Timeline:
    ├── Revenue Impact Progression:
    │   ├── T-60s: ₹0.5 Cr/hour impact rate
    │   ├── T-30s: ₹2.1 Cr/hour impact rate
    │   ├── T-0s: ₹8.7 Cr/hour current impact rate
    │   └── Projected: ₹15 Cr/hour if not resolved
    ├── Customer Impact Growth:
    │   ├── T-60s: 2,500 customers affected
    │   ├── T-30s: 12,000 customers affected
    │   ├── T-0s: 25,000 customers affected
    │   └── Growth Rate: 850 customers/minute
    └── Technical Recovery Metrics:
        ├── Infrastructure scaling ETA: 5 minutes
        ├── Database optimization ETA: 10 minutes
        ├── Cache warming ETA: 15 minutes
        └── Full system recovery ETA: 20 minutes
```
