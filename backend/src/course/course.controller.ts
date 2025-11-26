import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { ConfirmCourseDto } from './dto/confirm-course.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly configService: ConfigService,
  ) {}

  @Get('course/:id')
  getCourseByIdByAdmin(@Param('id') id: string, @CurrentUser() user: any) {
    const newId = Number(id);
    return this.courseService.getCourseById(newId, user?.id, user?.role);
  }

  @Post('/create-course')
  @UseInterceptors(
    FileInterceptor('course_avatar', {
      storage: diskStorage({
        destination: './uploads/course_url',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let { title, description, price, uploader } = createCourseDto;

    if (file) {
      createCourseDto.image_url = file
        ? `${this.configService.get('BACKEND_URL')}/uploads/course_url/${file.filename}`
        : '';
    }

    return this.courseService.create(createCourseDto);
  }

  @Post('/confirm-course')
  confirmCourse(@Body() confirmCourseDto: ConfirmCourseDto) {
    return this.courseService.confirmCourse(confirmCourseDto);
  }
  @Post('/delete-course')
  deletecourse(@Body() confirmCourseDto: ConfirmCourseDto) {
    return this.courseService.deleteCourse(confirmCourseDto);
  }

  @Get('/get-uploaded-courses')
  findAllUploaded(@CurrentUser() user: any) {
    return this.courseService.findAllUploaded(user?.id, user?.role);
  }

  @Get('/get-course-enrollments')
  getCourseEnrollments() {
    return this.courseService.getCoursesWithStudents();
  }

  @Roles('admin')
  @Get('/get-unconfirmed-courses')
  findAllUnconfirmed() {
    return this.courseService.findAllUnconfirmed();
  }

  @Put('/update-course')
  @UseInterceptors(
    FileInterceptor('course_avatar', {
      storage: diskStorage({
        destination: './uploads/course_url',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  updateCourse(
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateCourseDto.image_url = file
        ? `${this.configService.get('BACKEND_URL')}/uploads/course_url/${file.filename}`
        : '';
    }
    return this.courseService.updateCourse(updateCourseDto);
  }

  // ========== Course Lifecycle Endpoints ==========

  @Post(':id/start')
  @Roles('admin')
  startCourse(@Param('id') id: string) {
    return this.courseService.startCourse(+id);
  }

  @Post(':id/stop')
  @Roles('admin')
  stopCourse(@Param('id') id: string) {
    return this.courseService.stopCourse(+id);
  }

  @Get(':id/pending-certificates')
  @Roles('admin', 'teacher')
  async getPendingCertificates(@Param('id') id: string) {
    const count = await this.courseService.getPendingCertificatesCount(+id);
    return { count };
  }

  @Post(':id/template')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('template', {
      storage: diskStorage({
        destination: './uploads/templates',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `template-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async uploadTemplate(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const templateUrl = `${this.configService.get('BACKEND_URL')}/uploads/templates/${file.filename}`;
    return this.courseService.uploadCourseTemplate(
      +id,
      templateUrl,
      file.mimetype,
      file.path,
    );
  }

  @Get(':id/template')
  getCourseTemplate(@Param('id') id: string) {
    return this.courseService.getCourseTemplate(+id);
  }

  @Get(':id/access-check')
  async checkAccess(@Param('id') id: string, @CurrentUser() user: any) {
    const canAccess = await this.courseService.canStudentAccessCourse(
      user.id,
      +id,
    );
    return { canAccess };
  }
}
