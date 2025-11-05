┌─────────────────────────────┐
│         mirador-ui          │  ← React/Tailwind UI
│  (KPI Builder, Grid, Chat)  │
│   |                         │
│   | REST API call           │
│   v                         │
│  /api/v1/kpi/defs           │  ← HTTP proxy (via Vite dev proxy or nginx)
└───┬─────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│        mirador-core         │
│  (Go backend, sovereign)    │
│                             │
│  • /api/v1/kpi/def CRUD     │ ← stores KPI definitions
│  • /api/v1/metrics/query    │ ← fetches metrics from VictoriaMetrics
│  • /api/v1/mira/chat        │ ← proxies to mirador-rca (AI reasoning)
│  • /api/v1/rca/investigate  │ ← correlation engine output
└─────────────────────────────┘