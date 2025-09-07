import type { Router } from 'express';
import { Counter } from 'prom-client';

const pageViews = new Counter({ name: 'frontend_page_views_total', help: 'Frontend page views', labelNames: ['path'] });
const events = new Counter({ name: 'frontend_events_total', help: 'Frontend custom events', labelNames: ['type'] });

export function analyticsRoutes(router: Router) {
  router.post('/analytics/pageview', (req, res) => {
    const { path } = req.body as any;
    if (path) pageViews.inc({ path });
    res.status(204).end();
  });
  router.post('/analytics/event', (req, res) => {
    const { type } = req.body as any;
    if (type) events.inc({ type });
    res.status(204).end();
  });
}

