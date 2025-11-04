// src/quiz/quiz.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto, UpdateQuizQuestionDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';
import { create } from 'domain';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async getQuizDataByQuiz({
    quizId,
    lessonId,
    courseId,
  }: {
    quizId: number;
    lessonId?: number;
    courseId?: number;
  }) {
    if (!quizId) throw new Error('Quiz ID is required');

    // First, fetch the quiz with its basic relations
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        name: true,
        description: true,
        settings: true,
        questions: true,
        form: {
          select: {
            resource: {
              select: {
                id: true,
                lessonId: true,
                lesson: {
                  select: {
                    id: true,
                    courseId: true,
                    course: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    const resource = quiz.form?.resource;
    if (!resource) {
      throw new Error('Quiz is not associated with any resource');
    }

    // Validate course and lesson relationships after fetching
    if (courseId && resource.lesson?.courseId !== courseId) {
      throw new Error('Quiz does not belong to the specified course');
    }

    if (lessonId && resource.lessonId !== lessonId) {
      throw new Error('Quiz does not belong to the specified lesson');
    }

    console.log('Fetched quiz data:', quiz);

    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
      })),
    };
  }

  async patchQuizByLessonId({
 
    id,
    data,
  }: {

    id: number;
    data: UpdateQuizDto;
  }) {
    // Fetch quiz with form and resource
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        form: {
          include: { resource: true },
        },
        questions: true,
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!quiz.form?.resource)
      throw new BadRequestException('Quiz is not connected to a form/resource');
    if (quiz.form.resource.lessonId !== data.lessonId)
      throw new BadRequestException(
        'Quiz resource is not connected to this lesson',
      );

    // Ensure lesson belongs to course
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });
    if (!lesson || lesson.courseId !== data.courseId)
      throw new BadRequestException('Lesson does not belong to this course');

    // Prepare data to update only changed fields
    const quizUpdateData: any = {
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      settings:
        data.settings &&
        typeof quiz.settings === 'object' &&
        quiz.settings !== null
          ? { ...quiz.settings, ...data.settings }
          : (data.settings ?? undefined),
    };

    // Add new questions if provided
    if (data.questions?.length) {
      const newQuestions = data.questions
        .filter(
          (q): q is Required<UpdateQuizQuestionDto> => !!q.type && !!q.question,
        )
        .map((q, index) => ({
          type: q.type!,
          question: q.question!,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer ?? null,
          correctAnswers: q.correctAnswers
            ? JSON.stringify(q.correctAnswers)
            : null,
          required: q.required ?? false,
          order: quiz.questions.length + index,
          points: q.points ?? 1,
        }));

      quizUpdateData.questions = { create: newQuestions };
    }

    // Update quiz
    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: quizUpdateData,
      include: { questions: true },
    });

    return updatedQuiz;
  }

  async deleteQuiz(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // First delete all related questions
    if (quiz.questions && quiz.questions.length > 0) {
      await this.prisma.quizQuestion.deleteMany({
        where: { quizId: id },
      });
    }

    // Then delete the quiz
    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Quiz deleted successfully' };
  }

  // async submitQuizAttempt(createAttemptDto: CreateQuizAttemptDto) {
  //   const { quizId, responses } = createAttemptDto;

  //   // Verify quiz exists
  //   const quiz = await this.prisma.quiz.findUnique({
  //     where: { id: quizId },
  //     include: { questions: true },
  //   });

  //   if (!quiz) {
  //     throw new NotFoundException(`Quiz with ID ${quizId} not found`);
  //   }

  //   // Parse questions with correct answers
  //   const parsedQuestions = quiz.questions.map(q => ({
  //     ...q,
  //     options: q.options ? JSON.parse(q.options) : null,
  //     correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
  //     correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
  //   }));

  //   // Calculate score and detailed results
  //   const { score, results } = this.calculateScoreWithDetails(parsedQuestions, responses);

  //   // Create attempt
  //   const attempt = await this.prisma.quizAttempt.create({
  //     data: {
  //       quizId,
  //       responses: JSON.stringify(responses),
  //       score,
  //       totalPoints: parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
  //       detailedResults: JSON.stringify(results),
  //     },
  //   });

  //   return {
  //     ...attempt,
  //     percentage: (score / parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)) * 100,
  //     passed: score >= (quiz.settings ? JSON.parse(quiz.settings).passingScore || 0 : 0),
  //     results,
  //   };
  // }

  private calculateScoreWithDetails(questions: any[], responses: any[]) {
    let score = 0;
    const results: any[] = [];

    responses.forEach((response) => {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) return;

      const userAnswer = response.answer;
      let isCorrect = false;
      let earnedPoints = 0;

      switch (question.type) {
        case 'multiple':
          // For multiple choice, compare with correctAnswer (index)
          if (
            question.correctAnswer !== undefined &&
            userAnswer === question.correctAnswer
          ) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'checkbox':
          // For checkbox, compare arrays of indices
          if (
            question.correctAnswers &&
            Array.isArray(userAnswer) &&
            Array.isArray(question.correctAnswers)
          ) {
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
          if (
            question.correctAnswer !== undefined &&
            userAnswer === question.correctAnswer
          ) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'short':
        case 'long':
        case 'number':
          // For text/number questions, compare with correctAnswer (string/number)
          if (
            question.correctAnswer !== undefined &&
            userAnswer === question.correctAnswer
          ) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        default:
          // Fallback for unknown types
          if (
            question.correctAnswer !== undefined &&
            userAnswer === question.correctAnswer
          ) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer:
          question.correctAnswer !== undefined
            ? question.correctAnswer
            : question.correctAnswers,
        isCorrect,
        points: question.points || 1,
        earnedPoints,
      });
    });

    return { score, results };
  }

  // async getQuizAttempts(quizId: number) {
  //   const attempts = await this.prisma.quizAttempt.findMany({
  //     where: { quizId },
  //     orderBy: { submittedAt: 'desc' },
  //     include: {
  //       quiz: {
  //         include: {
  //           questions: true,
  //         },
  //       },
  //     },
  //   });

  //   return attempts.map(attempt => ({
  //     ...attempt,
  //     responses: attempt.responses ? JSON.parse(attempt.responses) : [],
  //     detailedResults: attempt.detailedResults ? JSON.parse(attempt.detailedResults) : [],
  //     percentage: (attempt.score / attempt.totalPoints) * 100,
  //     passed: attempt.score >= (attempt.quiz.settings ? JSON.parse(attempt.quiz.settings).passingScore || 0 : 0),
  //   }));
  // }

  async getUserQuizAttempts(quizId: number, userId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: {
        quizId,
        // Note: You'll need to add userId to your QuizAttempt model for this to work
        // userId: userId
      },
      orderBy: { submittedAt: 'desc' },
    });

    return attempts.map((attempt) => ({
      ...attempt,
      responses: attempt.responses ? JSON.parse(attempt.responses) : [],
      detailedResults: attempt.detailedResults
        ? JSON.parse(attempt.detailedResults)
        : [],
      percentage: (attempt.score / attempt.totalPoints) * 100,
      passed: attempt.score >= 50, // Default passing score, adjust as needed
    }));
  }

  async getQuizzesByLesson(lessonId: number) {
    // ✅ Fetch resources that belong to the given lesson
    const resources = await this.prisma.resource.findMany({
      where: { lessonId },
      include: {
        form: {
          include: {
            quizzes: {
              include: {
                questions: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });

    // ✅ Flatten all quizzes from all resources and format them
    const quizzes = resources.flatMap((resource) => {
      // resource.form may be an array (e.g. forms[]) or a single object depending on schema/typing.
      const forms = Array.isArray(resource.form)
        ? resource.form
        : resource.form
          ? [resource.form]
          : [];
      const quizzesForResource = forms.flatMap((f) => f.quizzes ?? []);

      return quizzesForResource.map((quiz) => ({
        ...quiz,
        refreshRequired: false,
        questions: quiz.questions.map((q) => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : [],
          correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
          correctAnswer: q.correctAnswer ?? undefined,
        })),
        settings: quiz.settings ? JSON.parse(quiz.settings) : null,
        resource: {
          id: resource.id,
          name: resource.name,
          type: resource.type,
          form: forms[0] ? { id: forms[0].id } : null,
        },
      }));
    });

    return quizzes;
  }

  // async getQuizStatistics(quizId: number) {
  //   const quiz = await this.getQuizById(quizId);
  //   const attempts = await this.getQuizAttempts(quizId);

  //   const totalAttempts = attempts.length;
  //   const averageScore = totalAttempts > 0
  //     ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
  //     : 0;

  //   const passingScore = quiz.settings?.passingScore || 0;
  //   const passingRate = totalAttempts > 0
  //     ? (attempts.filter(attempt => attempt.percentage >= passingScore).length / totalAttempts) * 100
  //     : 0;

  //   const questionStatistics = quiz.questions.map(question => {
  //     const questionAttempts = attempts.filter(attempt =>
  //       attempt.responses.some((response: any) => response.questionId === question.id)
  //     );

  //     const correctAnswers = questionAttempts.filter(attempt => {
  //       const response = attempt.responses.find((r: any) => r.questionId === question.id);
  //       if (!response) return false;

  //       // This is a simplified check - you might want to use the detailedResults instead
  //       const detailedResult = attempt.detailedResults?.find((r: any) => r.questionId === question.id);
  //       return detailedResult?.isCorrect || false;
  //     }).length;

  //     return {
  //       questionId: question.id,
  //       question: question.question,
  //       correctAnswers,
  //       totalAttempts: questionAttempts.length,
  //       successRate: questionAttempts.length > 0 ? (correctAnswers / questionAttempts.length) * 100 : 0,
  //     };
  //   });

  //   return {
  //     totalAttempts,
  //     averageScore,
  //     passingRate,
  //     questionStatistics,
  //   };
  // }

  //  async duplicateQuiz(id: number, name: string, req: Request) {
  //   // ✅ Step 1: (optional) CSRF session check (keep commented until test)
  //   // if (!req.session || !req.session.csrfToken) {
  //   //   return {
  //   //     refreshRequired: true,
  //   //     message: 'CSRF token not found in session',
  //   //   };
  //   // }

  //   // ✅ Step 2: Fetch original quiz
  //   const originalQuiz = await this.getQuizById(id);
  //   const form=await this.getQuizById(id);

  //   // ✅ Step 3: Duplicate the quiz and connect its form
  //   // const duplicatedQuiz = await this.prisma.quiz.create({
  //   //   data: {
  //   //     name,
  //   //     description: originalQuiz.description,

  //   //     settings: originalQuiz.settings
  //   //       ? JSON.stringify(originalQuiz.settings)
  //   //       : null,
  //   //     form: {
  //   //       create: {
  //   //         title: `${name} Form`,
  //   //         description: originalQuiz.description || '',
  //   //         ...(form.resourceId ? { resource: { connect: { id: form.resourceId } } } : {}),
  //   //       },
  //   //     },
  //   //     questions: {
  //   //       create: originalQuiz.questions.map((q) => ({
  //   //         type: q.type,
  //   //         question: q.question,
  //   //         options: q.options ? JSON.stringify(q.options) : null,
  //   //         correctAnswers: q.correctAnswers
  //   //           ? JSON.stringify(q.correctAnswers)
  //   //           : null,
  //   //         correctAnswer:
  //   //           q.correctAnswer !== undefined ? q.correctAnswer : null,
  //   //         required: q.required,
  //   //         order: q.order,
  //   //         points: q.points,
  //   //       })),
  //   //     },
  //   //   },
  //   //   include: {
  //   //     questions: true,
  //   //     form: true, // ✅ make sure form data is returned
  //   //     resource: true,
  //   //   },
  //   // });

  //   // // ✅ Step 4: Parse JSON fields safely
  //   // return {
  //   //   ...duplicatedQuiz,
  //   //   questions: duplicatedQuiz.questions.map((q) => ({
  //   //     ...q,
  //   //     options: q.options ? JSON.parse(q.options) : null,
  //   //     correctAnswers: q.correctAnswers
  //   //       ? JSON.parse(q.correctAnswers)
  //   //       : [],
  //   //     correctAnswer:
  //   //       q.correctAnswer !== null ? q.correctAnswer : undefined,
  //   //   })),
  //   //   settings: duplicatedQuiz.settings
  //   //     ? JSON.parse(duplicatedQuiz.settings)
  //   //     : null,
  //   // };
  // }
}
