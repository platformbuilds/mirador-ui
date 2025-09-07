import { MiradorApiService } from './MiradorApiService.js';

export class DataLayerService {
  constructor(private api: MiradorApiService) {}

  // Business log query builders (LogsQL-style DSL body)
  successRate(window: string) {
    return this.api.logsQuery({
      query: `_time:${window} | stats by (orgId) count() as total, count() if (status='SUCCESS') as ok | math (ok * 100.0) / total as success_rate`,
    });
  }

  errorPatterns(window: string) {
    return this.api.logsQuery({
      query: `_time:${window} status!=SUCCESS | stats by (orgId, errorCode) count() as error_count | sort by (error_count desc)`,
    });
  }

  processingTime(window: string) {
    return this.api.logsQuery({
      query: `_time:${window} | stats by (orgId, _time:5m) avg(processingTime) as avg_processing_time, quantile(0.95, processingTime) as p95_processing_time`,
    });
  }

  // Metric discovery and querying (Prometheus)
  labels() { return this.api.labels(); }
  labelValues(name: string) { return this.api.labelValues(name); }
  instantQuery(query: string) { return this.api.query(query); }
  rangeQuery(query: string, start: number, end: number, step: string) {
    return this.api.queryRange(query, start, end, step);
  }

  // Trace search and analysis
  traceServices() { return this.api.traceServices(); }
  traceOperations(service: string) { return this.api.traceOperations(service); }
  traceSearch(body: any) { return this.api.traceSearch(body); }
  traceById(traceId: string) { return this.api.traceById(traceId); }

  // Basic transformation utilities
  summarizeTraceSearch(resp: any) {
    // naive summarization: count by service and error presence
    const items = resp?.traces ?? [];
    const byService: Record<string, number> = {};
    let errors = 0;
    for (const t of items) {
      const svc = t?.service || 'unknown';
      byService[svc] = (byService[svc] || 0) + 1;
      if (t?.error) errors += 1;
    }
    return { total: items.length, byService, errors };
  }
}

