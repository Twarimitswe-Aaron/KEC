import { Controller, Post, Body, Get } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';

@Controller('service-request')
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) {}

  @Post()
  async create(
    @Body()
    body: {
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
    },
  ) {
    return this.serviceRequestService.create(body);
  }

  @Get()
  async findAll() {
    return this.serviceRequestService.findAll();
  }
}
