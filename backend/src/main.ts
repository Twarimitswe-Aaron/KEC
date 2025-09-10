import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import {doubleCsrf, type CsrfRequestMethod} from 'csrf-csrf'
import type { Request, Response, NextFunction } from 'express'
import { doubleCsrfProtection } from './csrf/csrf.config';
import crypto from 'crypto'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.use(helmet({
    contentSecurityPolicy: {
      directives:{
        defaultSrc:["'self"],
        scriptSrc:["'self"]
      }
    }
  }))
  app.use(cookieParser())
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies?.['sid']) {
      res.cookie('sid', crypto.randomBytes(16).toString('hex'), {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge:24*60*60*1000
      });
    }
    next();
  })

  
  app.use(doubleCsrfProtection)
  
  const config= new DocumentBuilder()
  .setTitle('KEC API Documentation')
  .setDescription('The KEC API description')
  .setVersion('1.0')
  .addTag('KEC')
  .build();
  const documentFactory=SwaggerModule.createDocument(app,config);
  if(process.env.NODE_ENV !== 'production'){
    SwaggerModule.setup('api',app, documentFactory);
  }
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
