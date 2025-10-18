// src/csrf/csrf.config.ts
import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function generateCsrfToken(req: Request, res: Response): string {
  
  const csrfToken = crypto.randomBytes(32).toString('hex');
 
  req.session.csrfToken = csrfToken;

  return csrfToken;
}

export function doubleCsrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
   
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'] as string;
    
  
    if (!req.session || !req.session.csrfToken) {
     
      return res.status(403).json({ message: 'CSRF token not found in session' });
    }

    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      console.error('CSRF Error: Token mismatch', {
        received: csrfToken,
        expected: req.session.csrfToken
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }
    
    next();
  };
}