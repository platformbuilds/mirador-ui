export const templates = [
  {
    id: 'infra-starter',
    name: 'Infrastructure Starter',
    config: {
      defaults: { orgId: '001' },
      sharing: { public: false },
      widgets: [
        { id: 'w1', type: 'line', title: 'CPU %', query: "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)", x: 0, y: 0, w: 6, h: 2, threshold: 80 },
        { id: 'w2', type: 'line', title: 'Memory %', query: "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100", x: 6, y: 0, w: 6, h: 2, threshold: 80 },
        { id: 'w3', type: 'line', title: 'Disk IO %', query: 'rate(node_disk_io_time_seconds_total[5m]) * 100', x: 0, y: 2, w: 6, h: 2 },
        { id: 'w4', type: 'timeline', title: 'Correlation', x: 6, y: 2, w: 6, h: 3 },
      ],
    },
  },
  {
    id: 'business-health',
    name: 'Business Health',
    config: {
      defaults: { orgId: '001' },
      sharing: { public: true },
      widgets: [
        { id: 'b1', type: 'stat', title: 'Success Rate %', query: 'success_rate_percent', x: 0, y: 0, w: 4, h: 2, threshold: 98 },
        { id: 'b2', type: 'line', title: 'Processing Time p95', query: 'processing_time_p95_ms', x: 4, y: 0, w: 8, h: 2, threshold: 2000 },
        { id: 'b3', type: 'timeline', title: 'Correlation', x: 0, y: 2, w: 12, h: 3 },
      ],
    },
  },
];

