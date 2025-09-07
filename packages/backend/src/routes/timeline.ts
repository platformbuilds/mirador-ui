import type { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { DataLayerService } from '../services/DataLayerService.js';
import { MiradorApiService } from '../services/MiradorApiService.js';

const schema = z.object({
  body: z.object({
    orgId: z.string().min(1),
    start: z.number().int(),
    end: z.number().int(),
    step: z.string().default('30s'),
  })
});

export function timelineRoutes(router: Router) {
  const api = new MiradorApiService();
  const dl = new DataLayerService(api);

  router.post('/timeline/correlate', validate(schema), async (req, res, next) => {
    try {
      const { orgId, start, end, step } = req.body as any;
      // Fetch representative metrics as per doc
      const cpu = await dl.rangeQuery(`100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`, start, end, step);
      const mem = await dl.rangeQuery(`(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`, start, end, step);
      const disk = await dl.rangeQuery(`rate(node_disk_io_time_seconds_total[5m]) * 100`, start, end, step);
      // Application-layer metrics
      const kafkaLag = await dl.rangeQuery(`kafka_consumer_lag_total`, start, end, step);
      const cassandraReadP95 = await dl.rangeQuery(`cassandra_read_latency_seconds{quantile="0.95"}`, start, end, step);
      const redisHitRate = await dl.rangeQuery(`rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) * 100`, start, end, step);
      // Log-derived signals
      const success = await dl.successRate('15m');
      const processing = await dl.processingTime('1h');
      const patterns = await dl.errorPatterns('1h');

      // Basic impact severity and confidence
      let severity = 'normal';
      let confidence = 0.5;
      try {
        const srItems = (success as any)?.data?.result || (success as any)?.result || [];
        const orgRow = srItems.find((r: any) => (r.metric?.orgId || r.orgId) === orgId) || srItems[0];
        const rate = Number(orgRow?.value?.[1] || orgRow?.success_rate || 99);
        if (rate < 95) { severity = 'critical'; confidence = 0.9; }
        else if (rate < 98) { severity = 'warning'; confidence = 0.7; }
      } catch {}

      // Trace-based simple summary (stub)
      let tracesSummary: any = { total: 0, byService: {}, errors: 0 };
      try {
        const tr = await dl.traceSearch({ limit: 20, lookback: '15m' });
        tracesSummary = dl.summarizeTraceSearch(tr);
      } catch {}

      const correlation = {
        orgId,
        window: { start, end, step },
        indicators: {
          infrastructure: { cpu, mem, disk },
          application: { kafkaLag, cassandraReadP95, redisHitRate },
          business: { success, processing },
        },
        errors: { patterns },
        severity,
        confidence,
        tracesSummary,
        // Placeholder: simple heuristic
        findings: [
          { at: end - 120, type: 'infrastructure', message: 'Resource pressure rising' },
          { at: end - 90, type: 'database', message: 'Latency spike suspected' },
          { at: end - 60, type: 'application', message: 'Throughput degradation' },
          { at: end - 30, type: 'business', message: 'Transaction success dip observed' },
        ],
      };
      res.json(correlation);
    } catch (e) { next(e); }
  });
}
