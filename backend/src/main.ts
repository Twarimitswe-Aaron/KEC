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
import * as express from 'express';


if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto as any;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: ['error', 'warn', 'log', 'debug']
  });
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); 
  }

 
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'x-csrf-token', 'Authorization'],
  });

 
  app.use(cookieParser());


  app.use(helmet());


  const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => Math.min(times * 50, 2000),
    enableOfflineQueue: false,
  });

  redisClient.on('connect', () => console.log('Connected to Redis'));
  redisClient.on('error', (err) => console.error('Redis error:', err));
  redisClient.on('ready', () => console.log('Redis ready'));

  let sessionStore;
  

  try {
    const pingResult = await redisClient.ping();
   
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
      ttl: 86400,
      disableTouch: false,
    });
  } catch (error) {
    console.error('Redis ping failed:', error);
    console.log('Falling back to memory store...');
    sessionStore = new session.MemoryStore();
  }


  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: false, 
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      name: 'sid',
      genid: (req) => crypto.randomBytes(16).toString('hex'),
    }),
  );

  
  app.use(doubleCsrfProtection());

  await startApp(app);
}


async function startApp(app: NestExpressApplication) {

  const options = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('app')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(4000, () => {
    console.log('Application is running on http://localhost:4000');
  });
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});