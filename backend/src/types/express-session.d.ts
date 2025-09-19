import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfSecret?: string;
    csrfToken?: string;
  }
}



