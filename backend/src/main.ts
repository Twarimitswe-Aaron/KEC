import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrfProtection } from './csrf/csrf.config';
import * as crypto from 'crypto';
import session from 'express-session';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';
import * as path from 'path';

// Fix for crypto module - add this at the top
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto as any;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: ['error', 'warn', 'log', 'debug']
  });



  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Important for security in production
  }

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
  });

  // Cookie parsing
  app.use(cookieParser());

  // Redis setup
  const redisClient = new Redis({
    host: '127.0.0.1', // Docker container name (use 'redis' instead of localhost)
    port: 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    enableOfflineQueue: false,
  });

  redisClient.on('connect', () => console.log('✅ Connected to Redis'));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err));
  redisClient.on('ready', () => console.log('✅ Redis ready'));

  // Test Redis connection
  try {
    const pingResult = await redisClient.ping();
    console.log('✅ Redis ping successful:', pingResult);
  } catch (error) {
    console.error('❌ Redis ping failed:', error);
    console.log('🔄 Falling back to memory store...');
    await setupMemoryStore(app);
    await startApp(app);
    return;
  }

  const redisStoreInstance = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 86400,
    disableTouch: false,
  });

  // Session configuration
  app.use(
    session({
      store: redisStoreInstance,
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      name: 'sid',
      genid: (req) => crypto.randomBytes(16).toString('hex'),
    }),
  );

  // CSRF Protection Middleware
  app.use(doubleCsrfProtection()); // Add CSRF protection globally

  await startApp(app);
}

// Start app after all middleware is set up
async function startApp(app: NestExpressApplication) {
  // Swagger setup (if needed)
  const options = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('app')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  // Security
  app.use(helmet());

  await app.listen(4000, () => {
    console.log('✅ Application is running on http://localhost:4000');
  });
}

// Fallback to memory store in case Redis is unavailable
async function setupMemoryStore(app: NestExpressApplication) {
  const memoryStore = new session.MemoryStore();
  app.use(
    session({
      store: memoryStore,
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      name: 'sid',
      genid: (req) => crypto.randomBytes(16).toString('hex'),
    }),
  );
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
