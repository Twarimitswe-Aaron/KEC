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
        questions: {
          create: questions.map((q, index) => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
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
          orderBy: { orderIndex: 'asc' },
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
      })),

    };
  }

  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto) {
    const { questions, ...quizData } = updateQuizDto;

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

    // Calculate score
    const score = this.calculateScore(quiz.questions, responses);

    // Create attempt
    return this.prisma.quizAttempt.create({
      data: {
        quizId,
        responses: JSON.stringify(responses),
        score,
        totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      },
    });
  }

  private calculateScore(questions: any[], responses: any[]): number {
    let score = 0;

    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;

      const correctAnswer = question.options ? JSON.parse(question.options) : null;
      const userAnswer = response.answer;

      switch (question.type) {
        case 'multiple':
          if (userAnswer === correctAnswer?.[0]) {
            score += question.points || 1;
          }
          break;
        case 'checkbox':
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...correctAnswer].sort();
            if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
              score += question.points || 1;
            }
          }
          break;
        case 'truefalse':
          if (userAnswer === correctAnswer?.[0]) {
            score += question.points || 1;
          }
          break;
        // For short/long/number, we might need manual grading
        default:
          // Auto-grade based on exact match for now
          if (userAnswer === correctAnswer?.[0]) {
            score += question.points || 1;
          }
      }
    });

    return score;
  }

  async getQuizAttempts(quizId: number) {
    return this.prisma.quizAttempt.findMany({
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
  }

  async getQuizzesByModule(moduleId: number) {
    return this.prisma.quiz.findMany({
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
  }

  async getQuizzesByLesson(lessonId: number) {
    return this.prisma.quiz.findMany({
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
  }
}