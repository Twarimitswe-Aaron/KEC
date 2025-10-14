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
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
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

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('modules')
export class ModuleController {
  constructor(private readonly svc: ModuleService) {}

  @Post(':id')
  create(@Body() dto: CreateModuleDto, @Param('id') id: string) {

    return this.svc.createModule(+id, dto);
  }

  // @Patch(':id/toggle-lock')
  // toggleLock(@Param('id', ParseIntPipe) id: number) {
  //   return this.svc.toggleLock(id);
  // }

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.svc.deleteModule(id);
  // }

  // // File upload (pdf/word)
  // @Post(':id/upload')
  // @UseInterceptors(FileInterceptor('file', {
  //   storage: diskStorage({
  //     destination: (req, file, cb) => {
  //       const dir = join(process.cwd(), 'uploads');
  //       if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  //       cb(null, dir);
  //     },
  //     filename: (req, file, cb) => {
  //       const safe = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
  //       cb(null, safe);
  //     }
  //   }),
  //   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  // }))
  // async uploadFile(
  //   @Param('id', ParseIntPipe) id: number,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body('type') type: string
  // ) {
  //   if (!file) throw new BadRequestException('No file uploaded');
  //   if (!['pdf', 'word'].includes(type)) throw new BadRequestException('Invalid file type');
  //   const url = `/uploads/${file.filename}`;
  //   const size = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
  //   // type cast
  //   const rt = type === 'pdf' ? 'pdf' : 'word';
  //   return this.svc.addFileResource(id, url, file.originalname, size, rt as any);
  // }

  // // Add video resource
  // @Post(':id/video')
  // addVideo(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateVideoDto) {
  //   return this.svc.addVideoResource(id, dto);
  // }

  // // Add quiz
  // @Post(':id/quiz')
  // addQuiz(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuizDto) {
  //   return this.svc.addQuizResource(id, dto);
  // }

  // // Remove resource
  // @Delete(':moduleId/resources/:resourceId')
  // removeResource(
  //   @Param('moduleId', ParseIntPipe) moduleId: number,
  //   @Param('resourceId', ParseIntPipe) resourceId: number
  // ) {
  //   return this.svc.removeResource(moduleId, resourceId);
  // }

  // // Submit quiz
  // @Post('quiz/:quizId/submit')
  // submitQuiz(@Param('quizId', ParseIntPipe) quizId: number, @Body() dto: SubmitQuizDto) {
  //   return this.svc.submitQuiz(quizId, dto.responses);
  // }
}
