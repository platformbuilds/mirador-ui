// MiradorStack UI Configuration
export const miradorstackConfig = {
  // Backend API configuration
  api: {
    baseUrl: process.env.VITE_MIRADOR_CORE_URL || "http://localhost:8080",
    endpoints: {
      metrics: "/api/v1/metrics",
      logs: "/api/v1/logs",
      traces: "/api/v1/traces",
      schema: "/api/v1/schema",
    },
    // API method mappings (transitioning from GraphQL to REST)
    methods: {
      metricsQuery: "POST",
      metricsQueryRange: "POST",
      logsQuery: "POST",
      logsHistogram: "POST",
      tracesSearch: "POST",
      traceById: "GET",
    },
  },

  // UI Branding
  branding: {
    name: "MiradorStack",
    title: "MiradorStack Observability Platform",
    description: "Modern observability dashboard for metrics, logs, and traces",
    logo: "/src/assets/miradorstack/logo.svg",
    favicon: "/src/assets/miradorstack/favicon.ico",
  },

  // Feature toggles
  features: {
    metrics: true,
    logs: true,
    traces: true,
    alerts: true,
    dashboards: true,
    customWidgets: true,
    realTimeUpdates: true,
  },

  // Default settings
  defaults: {
    refreshInterval: 30000, // 30 seconds
    timeRange: "1h",
    queryLanguage: "promql", // Default query language
    timezone: "local",
  },
};

export default miradorstackConfig;
