/**
 * MiradorStack API Composable
 * Provides reactive API integration for MiradorStack widgets
 */

import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import {
  MiradorStackQuery,
  MiradorStackWidgetData,
  MiradorStackAPIResponse,
  MiradorStackMetricsResponse,
  MiradorStackLogsResponse,
  MiradorStackTracesResponse,
} from "../types";

export interface UseMiradorStackAPIOptions {
  queries: MiradorStackQuery[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  timeRange?: {
    from: string;
    to: string;
  };
}

export function useMiradorStackAPI(options: UseMiradorStackAPIOptions) {
  const data = reactive<MiradorStackWidgetData>({
    timeSeries: [],
    logs: [],
    traces: [],
    alerts: [],
    services: [],
    metadata: {},
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  let refreshTimer: NodeJS.Timeout | null = null;

  // Get API base URL from runtime config
  const getAPIBaseURL = () => {
    const config = (window as any).__MIRADOR_CONFIG__;
    return config?.api?.baseUrl || "/api/v1";
  };

  // Execute a single query
  const executeQuery = async (query: MiradorStackQuery): Promise<any> => {
    const baseURL = getAPIBaseURL();
    const url = `${baseURL}/${query.type}`;

    const params = new URLSearchParams({
      query: query.query,
      datasource: query.datasource,
    });

    if (query.interval) {
      params.append("interval", query.interval);
    }

    if (query.maxDataPoints) {
      params.append("maxDataPoints", query.maxDataPoints.toString());
    }

    if (options.timeRange) {
      params.append("from", options.timeRange.from);
      params.append("to", options.timeRange.to);
    }

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Execute all queries
  const executeQueries = async () => {
    if (!options.queries.length) return;

    loading.value = true;
    error.value = null;

    try {
      const results = await Promise.all(options.queries.map((query) => executeQuery(query)));

      // Process and merge results
      data.timeSeries = [];
      data.logs = [];
      data.traces = [];
      data.alerts = [];
      data.services = [];

      results.forEach((result, index) => {
        const query = options.queries[index];

        if (result.success) {
          switch (query.type) {
            case "metrics":
              if (result.data.metrics) {
                // Convert metrics to time series format
                const timeSeries = convertMetricsToTimeSeries(result.data.metrics, query.name);
                data.timeSeries!.push(...timeSeries);
              }
              break;
            case "logs":
              if (result.data.logs) {
                data.logs!.push(...result.data.logs);
              }
              break;
            case "traces":
              if (result.data.traces) {
                data.traces!.push(...result.data.traces);
              }
              break;
          }
        }
      });

      lastUpdated.value = new Date();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("MiradorStack API Error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Convert metrics to time series format
  const convertMetricsToTimeSeries = (metrics: any[], seriesName: string) => {
    const seriesMap = new Map<string, any>();

    metrics.forEach((metric) => {
      const key = JSON.stringify(metric.labels || {});

      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          name:
            seriesName +
            (Object.keys(metric.labels || {}).length > 0
              ? ` (${Object.entries(metric.labels || {})
                  .map(([k, v]) => `${k}=${v}`)
                  .join(", ")})`
              : ""),
          data: [],
          unit: metric.unit,
        });
      }

      seriesMap.get(key)!.data.push({
        timestamp: new Date(metric.timestamp).getTime(),
        value: metric.value,
        labels: metric.labels,
      });
    });

    return Array.from(seriesMap.values());
  };

  // Setup auto-refresh
  const setupAutoRefresh = () => {
    if (options.autoRefresh && options.refreshInterval) {
      refreshTimer = setInterval(() => {
        executeQueries();
      }, options.refreshInterval * 1000);
    }
  };

  // Cleanup auto-refresh
  const cleanupAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  // Refresh data manually
  const refresh = () => {
    executeQueries();
  };

  // Watch for query changes
  watch(
    () => options.queries,
    () => {
      executeQueries();
    },
    { deep: true },
  );

  // Watch for time range changes
  watch(
    () => options.timeRange,
    () => {
      executeQueries();
    },
    { deep: true },
  );

  // Computed values
  const isEmpty = computed(() => {
    return (
      !data.timeSeries?.length &&
      !data.logs?.length &&
      !data.traces?.length &&
      !data.alerts?.length &&
      !data.services?.length
    );
  });

  const isStale = computed(() => {
    if (!lastUpdated.value || !options.refreshInterval) return false;
    const staleness = Date.now() - lastUpdated.value.getTime();
    return staleness > options.refreshInterval * 1000 * 1.5; // 150% of refresh interval
  });

  // Lifecycle hooks
  onMounted(() => {
    executeQueries();
    setupAutoRefresh();
  });

  onUnmounted(() => {
    cleanupAutoRefresh();
  });

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    isEmpty,
    isStale,
    refresh,
    executeQuery,
    executeQueries,
  };
}

// Utility function to create readonly reactive data
function readonly<T>(value: T): T {
  return value;
}
