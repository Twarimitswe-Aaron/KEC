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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { ConfirmCourseDto } from './dto/confirm-course.dto';
import { Role } from 'generated/prisma';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly configService: ConfigService,
  ) {}

  @Roles('admin')
  @Get('course/:id')
  getCourseByIdByAdmin(@Param('id') id: string) {

    const newId=Number(id);

  
    return this.courseService.getCourseById(newId);
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
    console.log(createCourseDto.image_url);

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
  findAllUploaded() {
    return this.courseService.findAllUploaded();
  }

 

  @Roles('admin')
  @Get('/get-unconfirmed-courses')
  findAllUnconfirmed() {
    return this.courseService.findAllUnconfirmed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
   
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
