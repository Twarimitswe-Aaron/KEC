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
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import {UpdateQuizDto} from "./dto/update-quiz.dto"
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto);
  }

  @Get()
  findAll(
    @Query('moduleId') moduleId?: string,
    @Query('lessonId') lessonId?: string,
  ) {
    if (moduleId) {
      return this.quizService.getQuizzesByModule(parseInt(moduleId));
    }
    if (lessonId) {
      return this.quizService.getQuizzesByLesson(parseInt(lessonId));
    }
    return []; // Or implement general quiz listing if needed
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.getQuizById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizService.updateQuiz(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.deleteQuiz(id);
  }

  @Post(':id/attempts')
  submitAttempt(
    @Param('id', ParseIntPipe) quizId: number,
    @Body() createAttemptDto: CreateQuizAttemptDto,
  ) {
    return this.quizService.submitQuizAttempt({
      ...createAttemptDto,
      quizId,
    });
  }

  @Get(':id/attempts')
  getAttempts(@Param('id', ParseIntPipe) quizId: number) {
    return this.quizService.getQuizAttempts(quizId);
  }
}