import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateStatus } from '@prisma/client';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('status') status?: CertificateStatus,
    @Query('studentId') studentId?: string,
  ) {
    return this.certificateService.findAll({
      courseId: courseId ? +courseId : undefined,
      status,
      studentId: studentId ? +studentId : undefined,
    });
  }

  @Post('generate')
  generateCertificates(
    @Body() body: { courseId: number; studentIds?: number[] },
  ) {
    return this.certificateService.generateForCourse(
      body.courseId,
      body.studentIds,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: CertificateStatus;
      rejectionReason?: string;
      certificateNumber?: string;
    },
  ) {
    return this.certificateService.updateStatus(
      +id,
      body.status,
      body.rejectionReason,
      body.certificateNumber,
    );
  }

  @Get('templates')
  getTemplates() {
    return this.certificateService.getTemplates();
  }

  @Post('templates')
  createTemplate(@Body() body: { name: string; content: string }) {
    return this.certificateService.createTemplate(body);
  }
}
