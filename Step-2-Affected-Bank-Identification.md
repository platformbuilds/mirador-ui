```
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
