import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService, PrismaService],
})
export class CertificateModule {}
