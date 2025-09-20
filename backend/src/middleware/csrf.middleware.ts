import { Request, Response } from 'express';

// CSRF protection middleware
export function doubleCsrfProtection() {
  return (req: Request, res: Response, next: Function) => {
    // Retrieve CSRF token from headers (sent by frontend)
    const csrfToken = req.headers['x-csrf-token'];

    // Check if CSRF token exists and matches the one stored in session
    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    // CSRF token is valid, continue to next middleware/route handler
    next();
  };
}
