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
  constructor(
    private prisma: PrismaService,
  ) {}

  async updateQuiz({ id, data }: { id: number; data: UpdateQuizDto }) {
    // Handle image uploads first if any
    if (data.questions) {
      for (const question of data.questions) {
        if (question.imageFile) {
          // The file has already been saved by the FileInterceptor
          // Just update the imageUrl to point to the saved file
          question.imageUrl = question.imageFile.path;
          delete question.imageFile; // Remove the file object
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      description: data.description,
      settings: data.settings,
    };

    // Only include imageUrl if it's provided
    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
    }

    // Update the quiz
    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        ...updateData,
        questions: {
          // Update existing questions
          update: data.questions?.map(q => ({
            where: { id: q.id },
            data: {
              type: q.type,
              question: q.question,
              description: q.description,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.type === 'truefalse' || q.type === 'multiple' ? 
                (typeof q.correctAnswer === 'number' ? q.correctAnswer : null) : 
                null,
              correctAnswers: q.type === 'checkbox' && q.correctAnswers ? 
                JSON.stringify(q.correctAnswers) : null,
              required: q.required,
              points: q.points,
              imageUrl: q.imageUrl,
            },
          })) || [],
        },
      },
      include: {
        questions: true,
      },
    });

    return updatedQuiz;
  }

  async getQuizDataByQuiz({
  quizId,
  lessonId,
  courseId,
  formId,
}: {
  quizId: number;
  lessonId?: number;
  courseId?: number;
  formId?: number;
}) {
  if (!quizId) throw new Error('Quiz ID is required');

  const quiz = await this.prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      form: {
        include: {
          resource: {
            include: {
              lesson: {
                include: {
                  course: true,
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

  if (courseId && resource.lesson?.courseId !== courseId) {
    throw new Error('Quiz does not belong to the specified course');
  }

  if (lessonId && resource.lessonId !== lessonId) {
    throw new Error('Quiz does not belong to the specified lesson');
  }

  // Format questions properly
  const formattedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    correctAnswers: q.correctAnswer || [],
    options: q.options || [],
    points: q.points,
    required: q.required,
    quizId: quiz.id,
  }));

  const totalPoints = formattedQuestions.reduce((sum, q) => sum + q.points, 0);
  const hasRequired = formattedQuestions.some((q) => q.required);

  const quizData = {
    id: quiz.id,
    name: quiz.name,
    description: quiz.description || '',
    createdAt: quiz.createdAt.toISOString(),
    required: hasRequired,
    points: totalPoints,
    questions: formattedQuestions,
    settings: quiz.settings,
    courseId: quiz.form?.resource.lesson?.courseId,
    lessonId: quiz.form?.resource.lessonId,
    formId: quiz.form?.id,
  };

  return quizData;
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

}