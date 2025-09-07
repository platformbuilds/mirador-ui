// Minimal OpenAPI spec to expose via Swagger UI
export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Mirador UI API', version: '0.1.0' },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/metrics': {
      get: {
        summary: 'Prometheus metrics',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};

