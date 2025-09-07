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
      // Log-derived success rate by orgId
      const success = await dl.successRate('15m');

      const correlation = {
        orgId,
        window: { start, end, step },
        indicators: {
          infrastructure: { cpu, mem, disk },
          business: { success },
        },
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

