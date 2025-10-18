import { Request, Response } from 'express';


export function doubleCsrfProtection() {
  return (req: Request, res: Response, next: Function) => {

    const csrfToken = req.headers['x-csrf-token'];


    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    next();
  };
}
