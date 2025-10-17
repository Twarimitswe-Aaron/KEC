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
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
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
    console.log("i am called to update this stuff")
    return this.quizService.updateQuiz(id, updateQuizDto);
  }

  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: Partial<UpdateQuizDto>,
  ) {
    return this.quizService.patchQuiz(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.deleteQuiz(id);
  }

  // Quiz Attempts
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

  @Get(':id/attempts/user/:userId')
  getUserAttempts(
    @Param('id', ParseIntPipe) quizId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.quizService.getUserQuizAttempts(quizId, userId);
  }

  // Quiz Statistics
  @Get(':id/statistics')
  getStatistics(@Param('id', ParseIntPipe) quizId: number) {
    return this.quizService.getQuizStatistics(quizId);
  }

  // Quiz Duplication
  @Post(':id/duplicate')
  duplicateQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string },
  ) {
    return this.quizService.duplicateQuiz(id, body.name);
  }

  // Bulk Question Operations
  @Put(':id/questions')
  bulkUpdateQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { questions: any[] },
  ) {
    return this.quizService.updateQuiz(id, { questions: body.questions });
  }

  // Quiz Validation (for manual grading)
  @Post(':id/validate')
  validateAnswers(
    @Param('id', ParseIntPipe) quizId: number,
    @Body() body: { responses: Array<{ questionId: number; answer: string }> },
  ) {
    // This would typically involve more complex validation logic
    // For now, we'll reuse the submitQuizAttempt logic but return detailed results
    return this.quizService.submitQuizAttempt({
      quizId,
      responses: body.responses,
    });
  }

  // Get quizzes with specific criteria
  @Get('search/findByCriteria')
  findByCriteria(
    @Query('title') title?: string,
    @Query('minQuestions') minQuestions?: string,
    @Query('maxQuestions') maxQuestions?: string,
    @Query('hasAttempts') hasAttempts?: string,
  ) {
    // Implementation would depend on your specific search requirements
    // This is a placeholder for advanced quiz search functionality
    return [];
  }

  // Quiz preview (without correct answers)
  @Get(':id/preview')
  async getQuizPreview(@Param('id', ParseIntPipe) id: number) {
    const quiz = await this.quizService.getQuizById(id);
    
    // Remove correct answers from questions for preview
    const previewQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        required: q.required,
        points: q.points,
        order: q.order,
        // Omit correctAnswers and correctAnswer
      })),
    };

    return previewQuiz;
  }

  // Quiz analytics summary
  @Get(':id/analytics/summary')
  async getAnalyticsSummary(@Param('id', ParseIntPipe) quizId: number) {
    const statistics = await this.quizService.getQuizStatistics(quizId);
    const attempts = await this.quizService.getQuizAttempts(quizId);

    const recentAttempts = attempts.slice(0, 5);
    const bestScore = attempts.length > 0 
      ? Math.max(...attempts.map(a => a.percentage))
      : 0;
    const worstScore = attempts.length > 0
      ? Math.min(...attempts.map(a => a.percentage))
      : 0;

    return {
      ...statistics,
      bestScore,
      worstScore,
      recentAttempts: recentAttempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        percentage: attempt.percentage,
        submittedAt: attempt.submittedAt,
        passed: attempt.passed,
      })),
    };
  }

  // Reset quiz attempts (admin functionality)
  @Delete(':id/attempts')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAttempts(@Param('id', ParseIntPipe) quizId: number) {
    // This would typically require admin permissions
    // Implementation depends on your Prisma schema
    // return this.quizService.clearQuizAttempts(quizId);
    throw new Error('Not implemented - requires admin permissions');
  }

  // Export quiz data
  @Get(':id/export')
  async exportQuiz(@Param('id', ParseIntPipe) quizId: number) {
    const quiz = await this.quizService.getQuizById(quizId);
    const attempts = await this.quizService.getQuizAttempts(quizId);

    return {
      quiz: {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        settings: quiz.settings,
        questions: quiz.questions,
      
      },
      attempts: attempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        responses: attempt.responses,
      })),
      exportDate: new Date().toISOString(),
      totalAttempts: attempts.length,
    };
  }
}