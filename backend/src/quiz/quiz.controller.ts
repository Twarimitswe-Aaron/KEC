// src/quiz/quiz.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}


  @Get('quiz/')
  findQuizDataByQuizId(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Query('lessonId', ParseIntPipe) lessonId: number,
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('formId', ParseIntPipe) formId: number,
  ) {
    return this.quizService.getQuizDataByQuiz({ quizId, lessonId, courseId, formId });
  }
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'question-*-image', maxCount: 1 },
  ]))
  async updateQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @UploadedFiles() files: { 
      image?: Express.Multer.File[];
      [key: string]: Express.Multer.File[] | undefined;
    } = {},
  ) {
    if (files?.image?.[0]) {
      updateQuizDto.imageUrl = `/uploads/quiz-images/${files.image[0].filename}`;
    }

    if (files) {
      const questionImages = Object.entries(files as Record<string, Express.Multer.File[]>)
        .filter(([key]) => key.startsWith('question-') && key.endsWith('-image'))
        .reduce<Record<number, Express.Multer.File>>((acc, [key, fileArray]) => {
          if (fileArray?.[0]) {
            const match = key.match(/question-(\d+)-image/);
            if (match) {
              const index = parseInt(match[1], 10);
              acc[index] = fileArray[0];
            }
          }
          return acc;
        }, {});

      if (updateQuizDto.questions) {
        updateQuizDto.questions = updateQuizDto.questions.map((q, index) => ({
          ...q,
          imageFile: questionImages[index],
        }));
      }
    }

    return this.quizService.updateQuiz({ id, data: updateQuizDto });
  }

}