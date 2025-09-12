import { doubleCsrf, type CsrfRequestMethod } from 'csrf-csrf';
import type { Request } from 'express';

const doubleCsrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || 'csrf-secret',
  getSessionIdentifier: (req: Request) =>
    req.cookies?.['sid'] || (req.headers['x-session-id'] as string) || req.ip,
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'] as CsrfRequestMethod[],
};

const csrfUtilities = doubleCsrf(doubleCsrfOptions);

export const doubleCsrfProtection = csrfUtilities.doubleCsrfProtection;

const invalidCsrfTokenErrorInternal = csrfUtilities.invalidCsrfTokenError;

export function isInvalidCsrfTokenError(err: unknown): boolean {
  return err === invalidCsrfTokenErrorInternal;
}

export const generateCsrfToken = csrfUtilities.generateCsrfToken;
