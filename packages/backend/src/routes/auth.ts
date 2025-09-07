import type { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { signToken } from '../middleware/auth.js';

const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(4) })
});

export function authRoutes(router: Router) {
  // Basic login for dev: uses env credentials, else a default in dev
  router.post('/auth/login', validate(loginSchema), (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const demoEmail = process.env.AUTH_DEMO_USER || 'admin@example.com';
    const demoPass = process.env.AUTH_DEMO_PASS || 'password';
    if (email === demoEmail && password === demoPass) {
      const token = signToken({ sub: email, role: 'admin' });
      return res.json({ token });
    }
    return res.status(401).json({ error: 'InvalidCredentials' });
  });
}

