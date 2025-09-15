import { doubleCsrf, type CsrfRequestMethod, type DoubleCsrfConfigOptions } from 'csrf-csrf';
import type { Request } from 'express';
import crypto from 'crypto';

const doubleCsrfOptions: DoubleCsrfConfigOptions ={
  getSecret: () => process.env.CSRF_SECRET || 'fallback-csrf-secret-32-characters-long',
  getSessionIdentifier: (req: Request) => {
    const sid = req.cookies?.sid;
    if (!sid) {
      console.error('No session cookie for CSRF validation');
      throw new Error('Session not initialized');
    }
    return sid;
  },
  
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true, // Allow frontend to read the cookie (optional, if needed)
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'] as CsrfRequestMethod[],
};

const csrfUtilities = doubleCsrf(doubleCsrfOptions);

export const doubleCsrfProtection = csrfUtilities.doubleCsrfProtection;
export const generateCsrfToken = csrfUtilities.generateCsrfToken;

const invalidCsrfTokenErrorInternal = csrfUtilities.invalidCsrfTokenError;

export function isInvalidCsrfTokenError(err: unknown): boolean {
  return err === invalidCsrfTokenErrorInternal;
}