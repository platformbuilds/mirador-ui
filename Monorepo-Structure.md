```
mirador-ui/
├── packages/
│   ├── frontend/                    # React application
│   │   ├── src/
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── dashboard/       # Dashboard builder components
│   │   │   │   ├── timeline/        # Timeline correlation components
│   │   │   │   ├── charts/          # D3.js visualization components
│   │   │   │   ├── forms/           # Configuration forms
│   │   │   │   └── common/          # Shared components
│   │   │   ├── pages/               # Application pages/routes
│   │   │   │   ├── Dashboard/       # Main dashboard page
│   │   │   │   ├── Builder/         # Dashboard builder page
│   │   │   │   ├── Timeline/        # Timeline correlation page
│   │   │   │   └── Settings/        # User settings page
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   │   ├── useApiClient.ts  # MIRADOR-CORE API integration
│   │   │   │   ├── useWebSocket.ts  # Real-time data streaming
│   │   │   │   ├── useTimeline.ts   # Timeline correlation logic
│   │   │   │   └── useDashboard.ts  # Dashboard state management
│   │   │   ├── stores/              # Zustand state stores
│   │   │   │   ├── dashboardStore.ts
│   │   │   │   ├── timelineStore.ts
│   │   │   │   └── userStore.ts
│   │   │   ├── services/            # External service integrations
│   │   │   │   ├── miradorApi.ts    # MIRADOR-CORE API client
│   │   │   │   ├── dashboardApi.ts  # Dashboard configuration API
│   │   │   │   └── websocketService.ts
│   │   │   ├── utils/               # Utility functions
│   │   │   │   ├── timelineHelpers.ts
│   │   │   │   ├── dataTransforms.ts
│   │   │   │   └── validators.ts
│   │   │   ├── types/               # TypeScript type definitions
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── timeline.ts
│   │   │   │   ├── mirador.ts
│   │   │   │   └── api.ts
│   │   │   └── assets/              # Static assets
│   │   ├── public/                  # Public assets
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   ├── backend/                     # Node.js API server
│   │   ├── src/
│   │   │   ├── controllers/         # Request handlers
│   │   │   │   ├── dashboardController.ts
│   │   │   │   ├── miradorProxyController.ts
│   │   │   │   ├── timelineController.ts
│   │   │   │   └── authController.ts
│   │   │   ├── services/            # Business logic
│   │   │   │   ├── DashboardService.ts
│   │   │   │   ├── MiradorApiService.ts
│   │   │   │   ├── TimelineService.ts
│   │   │   │   └── CacheService.ts
│   │   │   ├── middleware/          # Express middleware
│   │   │   │   ├── auth.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── cors.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/              # API route definitions
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── mirador.ts
│   │   │   │   ├── timeline.ts
│   │   │   │   └── auth.ts
│   │   │   ├── database/            # Database layer
│   │   │   │   ├── prisma/          # Prisma schema and migrations
│   │   │   │   ├── models/          # Database models
│   │   │   │   └── repositories/    # Data access layer
│   │   │   ├── websocket/           # WebSocket handlers
│   │   │   │   ├── timelineEvents.ts
│   │   │   │   ├── dashboardEvents.ts
│   │   │   │   └── connectionManager.ts
│   │   │   ├── utils/               # Utility functions
│   │   │   │   ├── logger.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── validators.ts
│   │   │   └── types/               # TypeScript definitions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── shared/                      # Shared utilities and types
│       ├── types/                   # Common TypeScript types
│       ├── constants/               # Shared constants
│       └── utils/                   # Shared utility functions
├── deployments/                     # Kubernetes deployments
│   ├── helm/                        # Helm charts
│   │   ├── mirador-ui/
│   │   │   ├── Chart.yaml
│   │   │   ├── values.yaml
│   │   │   ├── values-dev.yaml
│   │   │   ├── values-prod.yaml
│   │   │   └── templates/
│   │   │       ├── deployment.yaml
│   │   │       ├── service.yaml
│   │   │       ├── ingress.yaml
│   │   │       ├── configmap.yaml
│   │   │       └── haproxy-config.yaml
│   │   └── dependencies/            # Dependency charts
│   │       ├── mysql/
│   │       ├── valkey/
│   │       └── haproxy/
│   └── k8s/                         # Raw Kubernetes manifests
├── docs/                            # Documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── deployment-guide.md
│   └── user-guide.md
├── scripts/                         # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── dev-setup.sh
├── docker/                          # Docker configurations
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── docker-compose.dev.yml
├── .github/workflows/               # CI/CD pipelines
│   ├── build-test.yml
│   ├── deploy-staging.yml
│   └── deploy-production.yml
├── package.json                     # Root package.json (workspaces)
├── tsconfig.json                    # Root TypeScript config
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
└── README.md
```
