import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf, type CsrfRequestMethod } from 'csrf-csrf';
import type { Request, Response, NextFunction } from 'express';
import { doubleCsrfProtection } from './csrf/csrf.config';
import crypto from 'crypto';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  // 1. CORS first
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Parse cookies
  app.use(cookieParser());






  // 3. Session
// Enable session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-session-secret-minimum-32-chars',
    resave: false,
    saveUninitialized: false, // Changed to true for initial testing
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    name: 'sid',
    genid: (req) => {
      return crypto.randomBytes(16).toString('hex'); // Generate secure session IDs
    }
  }),
);



  // 5. CSRF AFTER cookies + session
  app.use(doubleCsrfProtection);

    // 4. Security headers
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self"],
            scriptSrc: ["'self"],
          },
        },
      }),
    );

  // 6. Swagger
  const config = new DocumentBuilder()
    .setTitle('KEC API Documentation')
    .setDescription('The KEC API description')
    .setVersion('1.0')
    .addTag('KEC')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap()

