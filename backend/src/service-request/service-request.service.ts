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

  async updateStatus(id: number, status: string) {
    return this.prisma.serviceRequest.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async delete(id: number) {
    return this.prisma.serviceRequest.delete({
      where: { id },
    });
  }
}
