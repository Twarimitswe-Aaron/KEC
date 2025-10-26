import * as fs from 'fs';
import * as path from 'path';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';
import { AddResourceDto } from './dto/add-resource.dto';
import { diskStorage } from 'multer';

@Controller('lesson')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class ModuleController {
  constructor(private readonly svc: ModuleService) {}

  // Create new lesson
  @Post('lesson')
  async createLesson(@Body() dto: CreateLessonDto) {
    return this.svc.createLesson(dto);
  }

  // Get all lessons by course ID
  @Get('lesson-by-course/:courseId')
  async getLessonsByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.svc.getLessonsByCourse(courseId);
  }

  // Get single lesson by ID
  @Get(':id')
  async getLessonById(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getLessonById(id);
  }

  // Delete lesson
  @Delete(':id')
  async deleteLesson(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLesson(id);
  }

  // Update existing lesson
  @Put(':id')
  async updateLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.svc.updateLesson(id, dto);
  }

  // Add resource to lesson - Main endpoint for file uploads
  @Post(':lessonId/resources')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = file.mimetype;
          if (
            !(
              type.includes('pdf') ||
              type.includes('msword') ||
              type.includes('officedocument')
            )
          ) {
            return cb(new Error('Only PDF or Word files are allowed'), '');
          }

          const folderType = type.includes('pdf') ? 'pdf' : 'word';
          const uploadDir = path.join(process.cwd(), 'uploads', folderType);

          fs.mkdirSync(uploadDir, { recursive: true });

          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const fileExt = path.extname(file.originalname);
          const baseName = path.basename(file.originalname, fileExt);
          const uniqueName = `${baseName}-${Date.now()}${fileExt}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async addResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title?: string; type: string; description?: string },
  ) {
    const { type } = body;

    const allowedTypes = ['pdf', 'word', 'quiz', 'video'] as const;
    if (!allowedTypes.includes(type as any)) {
      throw new BadRequestException(
        'Invalid resource type. Allowed: pdf, word, quiz, video',
      );
    }

    if (!file)
      throw new BadRequestException('File is required for PDF or Word type');

    const title =
      body.title || file.originalname.split('.').slice(0, -1).join('.');
    const fileUrl = `/uploads/${type}/${file.filename}`;

    const dto: AddResourceDto = {
      title,
      type: type as 'pdf' | 'word' | 'quiz',
      url: fileUrl,
      file,
      description: body.description || '',
    };

    return this.svc.addResource(lessonId, dto);
  }

  @Patch('lock/:id')
  async toggleLessonLock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleLockDto,
  ) {
    return this.svc.toggleLessonLock(id, dto);
  }

  // Delete resource from lesson
  @Delete(':lessonId/resources/:resourceId')
  async deleteResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('resourceId', ParseIntPipe) resourceId: number,
  ) {
    return this.svc.deleteResource(lessonId, resourceId);
  }

  // Reorder lessons
  @Put('reorder/:courseId')
  async reorderLessons(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('lessonIds') lessonIds: number[],
  ) {
    if (!lessonIds || !Array.isArray(lessonIds)) {
      throw new BadRequestException('lessonIds must be an array');
    }

    return this.svc.reorderLessons(courseId, lessonIds);
  }

  // Duplicate lesson
  // @Post(':id/duplicate')
  // async duplicateLesson(@Param('id', ParseIntPipe) id: number) {
  //   return this.svc.duplicateLesson(id);
  // }

  // Add quiz resource - more specific route first
  @Post('course/:courseId/lesson/:lessonId/quiz')
  async addQuizResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateQuizDto,
  ) {
    return this.svc.addQuizResource(lessonId, courseId, dto);
  }

  // Add video resource (alternative endpoint for video links)
  @Post(':lessonId/video')
  async addVideoResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateVideoDto,
  ) {
    return this.svc.addVideoResource(lessonId, dto);
  }

  // Submit quiz
  @Post('quiz/:quizId/submit')
  async submitQuiz(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.svc.submitQuiz(quizId, dto.responses);
  }

  // Module-specific endpoints (alias for lesson endpoints)
  @Post('module/:courseId')
  async createModule(
    @Body() dto: CreateLessonDto,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.svc.createModule(courseId, dto);
  }
}
