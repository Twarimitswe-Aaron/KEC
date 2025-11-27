import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CertificateService } from './certificate.service';
import { CertificateStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UseInterceptors, UploadedFile } from '@nestjs/common';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('status') status?: CertificateStatus,
    @Query('studentId') studentId?: string,
    @Request() req?: any,
  ) {
    // If user is a student, force filter by their ID
    // Note: This assumes req.user is populated by a guard.
    // If no guard is present, we might need to add one or rely on the service to handle it if passed.
    // However, for "My Certificates", we likely want to use the logged-in user's ID.

    let targetStudentId = studentId ? +studentId : undefined;

    // Check if we have a user in the request (from AuthGuard)
    if (req?.user && req.user.role === 'student') {
      targetStudentId = req.user.id;
    }

    return this.certificateService.findAll({
      courseId: courseId ? +courseId : undefined,
      status,
      studentId: targetStudentId,
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

  @Roles('admin')
  @Patch('status')
  updateStatus(
    @Body()
    body: {
      studentId: number;
      courseId: number;
      status: CertificateStatus;
      rejectionReason?: string;
      certificateNumber?: string;
      description?: string;
    },
  ) {
    return this.certificateService.updateStatus(
      body.studentId,
      body.courseId,
      body.status,
      body.rejectionReason,
      body.certificateNumber,
      body.description,
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

  @Get('pending-courses')
  getEndedCoursesWithStudents() {
    return this.certificateService.getEndedCoursesWithStudents();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'certificates');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { courseId?: string; name?: string },
  ) {
    return this.certificateService.uploadTemplate(
      file,
      body.courseId ? +body.courseId : undefined,
      body.name,
    );
  }
}
