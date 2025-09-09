import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const config= new DocumentBuilder()
  .setTitle('KEC API Documentation')
  .setDescription('The KEC API description')
  .setVersion('1.0')
  .addTag('KEC')
  .build();
  const documentFactory=SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('api',app, documentFactory);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
