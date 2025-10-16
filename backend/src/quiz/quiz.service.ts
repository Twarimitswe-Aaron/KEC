// src/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(createQuizDto: CreateQuizDto) {
    const { questions, settings, ...quizData } = createQuizDto;

    return this.prisma.quiz.create({
      data: {
        ...quizData,
        settings: settings ? JSON.stringify(settings) : null,
        questions: {
          create: questions.map((q, index) => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswers: q.correctAnswers ? JSON.stringify(q.correctAnswers) : null,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
            required: q.required || false,
            order: index,
            points: q.points || 1,
          })),
        },
      },
      include: {
        questions: true,
        resource: true,
      },
    });
  }

  async getQuizById(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        resource: {
          include: {
            module: true,
            lesson: true,
          },
        },
        attempts: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
        correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
      })),
      settings: quiz.settings ? JSON.parse(quiz.settings) : null,
    };
  }

  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto) {
    const { questions, settings, ...quizData } = updateQuizDto;

    // Verify quiz exists
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Start transaction for atomic update
    return this.prisma.$transaction(async (tx) => {
      // Update quiz basic info
      const updatedQuiz = await tx.quiz.update({
        where: { id },
        data: {
          ...quizData,
          settings: settings ? JSON.stringify(settings) : undefined,
        },
      });

      // Handle questions update if provided
      if (questions) {
        // Delete existing questions
        await tx.quizQuestion.deleteMany({
          where: { quizId: id },
        });

        // Create new questions
        await tx.quizQuestion.createMany({
          data: questions.map((q, index) => ({
            quizId: id,
            type: q.type!,
            question: q.question!,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswers: q.correctAnswers ? JSON.stringify(q.correctAnswers) : null,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
            required: q.required || false,
            order: index,
            points: q.points || 1,
          })),
        });
      }

      return this.getQuizById(id);
    });
  }

  async deleteQuiz(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // If quiz is linked to a resource, we might want to handle that differently
    if (quiz.resource) {
      // Option 1: Delete the resource as well
      // await this.prisma.resource.delete({ where: { id: quiz.resource.id } });
      
      // Option 2: Just remove the quiz link
      await this.prisma.resource.update({
        where: { id: quiz.resource.id },
        data: { quizId: null },
      });
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  async submitQuizAttempt(createAttemptDto: CreateQuizAttemptDto) {
    const { quizId, responses } = createAttemptDto;

    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Parse questions with correct answers
    const parsedQuestions = quiz.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
      correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
    }));

    // Calculate score and detailed results
    const { score, results } = this.calculateScoreWithDetails(parsedQuestions, responses);

    // Create attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        responses: JSON.stringify(responses),
        score,
        totalPoints: parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        detailedResults: JSON.stringify(results),
      },
    });

    return {
      ...attempt,
      percentage: (score / parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)) * 100,
      passed: score >= (quiz.settings ? JSON.parse(quiz.settings).passingScore || 0 : 0),
      results,
    };
  }

  private calculateScoreWithDetails(questions: any[], responses: any[]) {
    let score = 0;
    const results: any[] = [];

    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;

      const userAnswer = response.answer;
      let isCorrect = false;
      let earnedPoints = 0;

      switch (question.type) {
        case 'multiple':
          // For multiple choice, compare with correctAnswer (index)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'checkbox':
          // For checkbox, compare arrays of indices
          if (question.correctAnswers && Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...question.correctAnswers].sort();
            if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
              isCorrect = true;
              earnedPoints = question.points || 1;
              score += earnedPoints;
            }
          }
          break;

        case 'truefalse':
          // For true/false, compare with correctAnswer (index)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'short':
        case 'long':
        case 'number':
          // For text/number questions, compare with correctAnswer (string/number)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        default:
          // Fallback for unknown types
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : question.correctAnswers,
        isCorrect,
        points: question.points || 1,
        earnedPoints,
      });
    });

    return { score, results };
  }

  async getQuizAttempts(quizId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: { submittedAt: 'desc' },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    return attempts.map(attempt => ({
      ...attempt,
      responses: attempt.responses ? JSON.parse(attempt.responses) : [],
      detailedResults: attempt.detailedResults ? JSON.parse(attempt.detailedResults) : [],
      percentage: (attempt.score / attempt.totalPoints) * 100,
      passed: attempt.score >= (attempt.quiz.settings ? JSON.parse(attempt.quiz.settings).passingScore || 0 : 0),
    }));
  }

  async getUserQuizAttempts(quizId: number, userId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { 
        quizId,
        // Note: You'll need to add userId to your QuizAttempt model for this to work
        // userId: userId 
      },
      orderBy: { submittedAt: 'desc' },
    });

    return attempts.map(attempt => ({
      ...attempt,
      responses: attempt.responses ? JSON.parse(attempt.responses) : [],
      detailedResults: attempt.detailedResults ? JSON.parse(attempt.detailedResults) : [],
      percentage: (attempt.score / attempt.totalPoints) * 100,
      passed: attempt.score >= (50), // Default passing score, adjust as needed
    }));
  }

  async getQuizzesByModule(moduleId: number) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        resource: {
          moduleId,
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        resource: true,
      },
    });

    return quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
        correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
      })),
      settings: quiz.settings ? JSON.parse(quiz.settings) : null,
    }));
  }

  async getQuizzesByLesson(lessonId: number) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        resource: {
          lessonId,
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        resource: true,
      },
    });

    return quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
        correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
      })),
      settings: quiz.settings ? JSON.parse(quiz.settings) : null,
    }));
  }

  async getQuizStatistics(quizId: number) {
    const quiz = await this.getQuizById(quizId);
    const attempts = await this.getQuizAttempts(quizId);

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts 
      : 0;
    
    const passingScore = quiz.settings?.passingScore || 0;
    const passingRate = totalAttempts > 0
      ? (attempts.filter(attempt => attempt.percentage >= passingScore).length / totalAttempts) * 100
      : 0;

    const questionStatistics = quiz.questions.map(question => {
      const questionAttempts = attempts.filter(attempt => 
        attempt.responses.some((response: any) => response.questionId === question.id)
      );
      
      const correctAnswers = questionAttempts.filter(attempt => {
        const response = attempt.responses.find((r: any) => r.questionId === question.id);
        if (!response) return false;

        // This is a simplified check - you might want to use the detailedResults instead
        const detailedResult = attempt.detailedResults?.find((r: any) => r.questionId === question.id);
        return detailedResult?.isCorrect || false;
      }).length;

      return {
        questionId: question.id,
        question: question.question,
        correctAnswers,
        totalAttempts: questionAttempts.length,
        successRate: questionAttempts.length > 0 ? (correctAnswers / questionAttempts.length) * 100 : 0,
      };
    });

    return {
      totalAttempts,
      averageScore,
      passingRate,
      questionStatistics,
    };
  }

  async duplicateQuiz(id: number, name: string) {
    const originalQuiz = await this.getQuizById(id);

    return this.prisma.quiz.create({
      data: {
        name,
        description: originalQuiz.description,
        settings: originalQuiz.settings ? JSON.stringify(originalQuiz.settings) : null,
        questions: {
          create: originalQuiz.questions.map(q => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswers: q.correctAnswers ? JSON.stringify(q.correctAnswers) : null,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
            required: q.required,
            order: q.order,
            points: q.points,
          })),
        },
      },
      include: {
        questions: true,
        resource: true,
      },
    });
  }
}