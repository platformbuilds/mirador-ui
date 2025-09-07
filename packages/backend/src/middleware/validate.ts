import type { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
    });
    if (!result.success) {
      return res.status(400).json({ error: 'ValidationError', details: result.error.flatten() });
    }
    next();
  };

