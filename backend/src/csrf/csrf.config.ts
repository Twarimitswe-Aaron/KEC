// src/csrf/csrf.config.ts
import * as crypto from 'crypto';
import { Request, Response } from 'express';

export function generateCsrfToken(req: Request, res: Response): string {
  // Generate a random CSRF token and store it in session
  const csrfToken = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = csrfToken;
  return csrfToken;
}

export function doubleCsrfProtection() {
  return (req: Request, res: Response, next: Function) => {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }
    next();
  };
}
