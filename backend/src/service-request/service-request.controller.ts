import { Controller, Post, Body, Get, Patch, Delete, Param } from '@nestjs/common';
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

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    return this.serviceRequestService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.serviceRequestService.delete(+id);
  }
}
