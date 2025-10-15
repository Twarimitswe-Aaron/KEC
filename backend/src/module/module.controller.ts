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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('lesson')
export class ModuleController {
  constructor(private readonly svc: ModuleService) {}

  
  // Create new lesson
  @Post()
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


  // Update existing lesson
  @Put(':id')
  async updateLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.svc.updateLesson(id, dto);
  }

  // Delete lesson
  @Delete(':id')
  async deleteLesson(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLesson(id);
  }

  // Toggle lesson lock status (using Module since Lesson doesn't have isUnlocked)
  @Patch('/lock/:id')
  async toggleLessonLock(
    @Param('id') id: number,
    @Body() dto: ToggleLockDto,
  ) {
   
    return this.svc.toggleLessonLock(id, dto);
  }

  // Add resource to lesson
  @Post(':lessonId/resources')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(process.cwd(), 'uploads', 'resources');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const safe = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
        cb(null, safe);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }))
  async addResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('type') type: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!['pdf', 'video', 'word', 'quiz'].includes(type)) {
      throw new BadRequestException('Invalid file type');
    }

    const url = `/uploads/resources/${file.filename}`;
    return this.svc.addResource(lessonId, {
      title,
      file,
      type: type as 'pdf' | 'word' | 'video' | 'quiz',
      url,
    });
  }

  @Delete('/lesson/:id')
  async deleteLessonAlt(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLesson(id);
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
  @Post(':id/duplicate')
  async duplicateLesson(@Param('id', ParseIntPipe) id: number) {
    return this.svc.duplicateLesson(id);
  }

  // Add video resource (alternative endpoint for video links)
  @Post(':lessonId/video')
  async addVideoResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateVideoDto,
  ) {
    return this.svc.addVideoResource(lessonId, dto);
  }

  // Add quiz resource
  @Post(':lessonId/quiz')
  async addQuizResource(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateQuizDto,
  ) {
    return this.svc.addQuizResource(lessonId, dto);
  }

  // Submit quiz
  @Post('quiz/:quizId/submit')
  async submitQuiz(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.svc.submitQuiz(quizId, dto.responses);
  }

  // Module-specific endpoints
  @Post('module/:courseId')
  async createModule(@Body() dto: CreateLessonDto, @Param('courseId') courseId: string) {
    return this.svc.createModule(+courseId, dto);
  }
}