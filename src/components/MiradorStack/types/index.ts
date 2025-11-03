/**
 * MiradorStack Widget Types
 * Custom widget type definitions for MiradorStack platform
 */

export interface MiradorStackMetric {
  timestamp: string;
  value: number;
  labels: Record<string, string>;
  unit?: string;
}

export interface MiradorStackLogEntry {
  timestamp: string;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  message: string;
  source: string;
  labels: Record<string, string>;
  traceId?: string;
  spanId?: string;
}

export interface MiradorStackTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: string;
  endTime: string;
  duration: number;
  tags: Record<string, string>;
  logs?: MiradorStackLogEntry[];
  references?: {
    type: "child_of" | "follows_from";
    traceId: string;
    spanId: string;
  }[];
}

export interface MiradorStackAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  labels: Record<string, string>;
  status: "firing" | "resolved";
}

export interface MiradorStackService {
  id: string;
  name: string;
  version: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  endpoints: string[];
  dependencies: string[];
  metrics: {
    requestRate: number;
    errorRate: number;
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
}

export interface MiradorStackDashboardConfig {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  widgets: MiradorStackWidgetConfig[];
  timeRange: {
    from: string;
    to: string;
    refreshInterval?: string;
  };
}

export interface MiradorStackWidgetConfig {
  id: string;
  type: MiradorStackWidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: MiradorStackWidgetOptions;
  queries: MiradorStackQuery[];
}

export type MiradorStackWidgetType =
  | "metrics-chart"
  | "logs-viewer"
  | "trace-viewer"
  | "service-map"
  | "alert-list"
  | "correlation-matrix"
  | "performance-heatmap"
  | "error-rate-gauge"
  | "sla-status"
  | "tenant-overview";

export interface MiradorStackWidgetOptions {
  chart?: {
    type: "line" | "bar" | "area" | "gauge" | "heatmap";
    colors?: string[];
    legend?: boolean;
    tooltip?: boolean;
  };
  filters?: {
    tenant?: string;
    service?: string;
    environment?: string;
    timeRange?: string;
  };
  formatting?: {
    unit?: string;
    decimals?: number;
    threshold?: {
      value: number;
      color: string;
    }[];
  };
  display?: {
    showHeader?: boolean;
    showLegend?: boolean;
    showTooltips?: boolean;
    height?: number;
  };
}

export interface MiradorStackQuery {
  id: string;
  name: string;
  type: "metrics" | "logs" | "traces";
  query: string;
  datasource: string;
  interval?: string;
  maxDataPoints?: number;
}

export interface MiradorStackDataPoint {
  timestamp: number;
  value: number | string;
  labels?: Record<string, string>;
}

export interface MiradorStackTimeSeriesData {
  name: string;
  data: MiradorStackDataPoint[];
  unit?: string;
  color?: string;
}

export interface MiradorStackWidgetData {
  timeSeries?: MiradorStackTimeSeriesData[];
  logs?: MiradorStackLogEntry[];
  traces?: MiradorStackTrace[];
  alerts?: MiradorStackAlert[];
  services?: MiradorStackService[];
  metadata?: Record<string, any>;
}

// API Response Types
export interface MiradorStackAPIResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface MiradorStackMetricsResponse extends MiradorStackAPIResponse {
  data: {
    metrics: MiradorStackMetric[];
    metadata: {
      query: string;
      executionTime: number;
      resultCount: number;
    };
  };
}

export interface MiradorStackLogsResponse extends MiradorStackAPIResponse {
  data: {
    logs: MiradorStackLogEntry[];
    metadata: {
      query: string;
      executionTime: number;
      resultCount: number;
      nextToken?: string;
    };
  };
}

export interface MiradorStackTracesResponse extends MiradorStackAPIResponse {
  data: {
    traces: MiradorStackTrace[];
    metadata: {
      query: string;
      executionTime: number;
      resultCount: number;
    };
  };
}
