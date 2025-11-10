// src/quiz/quiz.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuizDto, UpdateQuizQuestionDto } from './dto/update-quiz.dto';


@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async updateQuiz({ id, data }: { id: number; data: UpdateQuizDto }) {
  if (data.questions) {
    for (const question of data.questions) {
      if (question.imageFile && question.type === "labeling") {
        question.imageUrl = question.imageFile.path;
      }
      delete question.imageFile;
    }
  }

  console.log("Updating quiz with data:", data.questions);

  const updateData: any = {
    name: data.name,
    description: data.description,
    settings: data.settings,
  };

  if (data.imageUrl) {
    updateData.imageUrl = data.imageUrl;
  }

  const updatedQuiz = await this.prisma.quiz.update({
    where: { id },
    data: updateData,
    include: {
      questions: true,
    },
  });


  if (data.questions!.length > 0) {


    await this.prisma.quiz.update({
      where: { id },
      data: {
        questions: {
          create: data.questions!.map(q => {
            if (!q.question?.trim()) {
              throw new BadRequestException("Question text is required for all questions");
            }

            // Ensure options and correctAnswers are properly formatted as arrays
            const questionData: any = {
              type: q.type,
              question: q.question.trim(),
              options: Array.isArray(q.options) ? q.options : [],
              required: q.required ?? false,
              points: q.points ?? 1,
            };

            // Handle correctAnswers based on question type
            if (q.type === 'multiple' && q.correctAnswers) {
              questionData.correctAnswers = Array.isArray(q.correctAnswers) 
                ? q.correctAnswers 
                : [q.correctAnswers];
            } else if ((q.type === 'checkbox' || q.type === 'labeling') && q.correctAnswers) {
              questionData.correctAnswers = Array.isArray(q.correctAnswers)
                ? q.correctAnswers
                : [q.correctAnswers];
            } else {
              questionData.correctAnswers = [];
            }

            if (q.type === 'labeling' && q.imageUrl) {
              questionData.imageUrl = q.imageUrl;
            }

            return questionData;
          }),
        },
      },
    });
  }

  const message =
    data.questions?.length === 0
      ? "Quiz updated successfully"
      : data.questions?.length === 1
      ? "Question created successfully"
      : "Questions created successfully";

  return { message };
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

  const formattedQuestions = quiz.questions.map((q) => {
    // Parse options from JSON string if it's a string
    const options = typeof q.options === 'string' 
      ? JSON.parse(q.options) 
      : Array.isArray(q.options) 
        ? q.options 
        : [];

    // Parse correctAnswers from JSON string if it's a string
    let correctAnswers = [];
    if (q.correctAnswers) {
      correctAnswers = typeof q.correctAnswers === 'string' 
        ? JSON.parse(q.correctAnswers)
        : Array.isArray(q.correctAnswers)
          ? q.correctAnswers
          : [];
    }

    return {
      id: q.id,
      type: q.type,
      question: q.question,
      correctAnswers: correctAnswers,
      options: options,
      points: q.points,
      required: q.required,
      quizId: quiz.id,
    };
  });

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