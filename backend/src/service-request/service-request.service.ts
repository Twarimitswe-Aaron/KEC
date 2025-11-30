import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceRequestService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    district: string;
    sector: string;
    location: string;
    serviceType: 'INSTALLATION' | 'REPAIR';
    equipmentDescription?: string;
    problemDescription?: string;
    problemImage?: string;
    installationDetails?: string;
    preferredDate?: string;
    preferredTime?: string;
    urgencyLevel?: string;
  }) {
    return this.prisma.serviceRequest.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.serviceRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
