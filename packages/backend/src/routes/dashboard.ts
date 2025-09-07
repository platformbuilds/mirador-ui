import type { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';

const prisma = new PrismaClient();

const createSchema = z.object({
  body: z.object({ name: z.string().min(1), config: z.any() })
});
const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ name: z.string().min(1).optional(), config: z.any().optional() })
});

export function dashboardRoutes(router: Router) {
  router.get('/dashboards', authRequired, async (_req, res) => {
    const items = await prisma.dashboard.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(items);
  });

  router.post('/dashboards', authRequired, validate(createSchema), async (req, res) => {
    const { name, config } = req.body as any;
    const ownerEmail = (req as any).user?.sub as string | undefined;
    const owner = ownerEmail
      ? await prisma.user.upsert({
          where: { email: ownerEmail },
          update: {},
          create: { email: ownerEmail },
        })
      : null;
    const item = await prisma.dashboard.create({ data: { name, config, ownerId: owner ? owner.id : undefined as any } });
    res.status(201).json(item);
  });

  router.get('/dashboards/:id', authRequired, async (req, res) => {
    const item = await prisma.dashboard.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'NotFound' });
    res.json(item);
  });

  router.put('/dashboards/:id', authRequired, validate(updateSchema), async (req, res) => {
    const { id } = req.params as any;
    const item = await prisma.dashboard.update({ where: { id }, data: req.body });
    res.json(item);
  });

  router.delete('/dashboards/:id', authRequired, async (req, res) => {
    const { id } = req.params as any;
    await prisma.dashboard.delete({ where: { id } });
    res.status(204).end();
  });
}

