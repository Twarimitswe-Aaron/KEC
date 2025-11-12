// src/quiz/quiz.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuizDto, UpdateQuizQuestionDto } from './dto/update-quiz.dto';
import { Express } from 'express';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

async updateQuiz({ id, data }: { id: number; data: UpdateQuizDto }) {
  // Image processing is already handled by the controller
  // Remove imageFile objects before database operations
  if (data.questions) {
    for (const question of data.questions) {
      if (question.imageFile) {
        delete question.imageFile; // Remove file object, keep imageUrl from controller
      }
    }
  }

  this.logger.debug('Updating quiz with data:', { 
    quizId: id,
    questionCount: data.questions?.length || 0 
  });

  // 2️⃣ Prepare quiz update data
  const updateData: any = {
    name: data.name,
    description: data.description,
    settings: data.settings,
  };

  if (data.imageUrl) updateData.imageUrl = data.imageUrl;
  console.log(updateData,"updateData")

  // 3️⃣ Start transaction for consistency
  return this.prisma.$transaction(async (tx) => {
    // Update quiz basic info
    const updatedQuiz = await tx.quiz.update({
      where: { id },
      data: updateData,
      include: { questions: true },
    });

    // ✅ Case 1: No questions provided → only update quiz info
    if (!data.questions || data.questions.length === 0) {
      return {
        message: "Quiz updated successfully",
      };
    }


    // First delete all existing questions for this quiz
    // Delete all existing questions for this quiz
    await tx.quizQuestion.deleteMany({ where: { quizId: id } });

    // Create new questions
    await tx.quizQuestion.createMany({
      data: data.questions.map((q) => {
        if (!q.question?.trim()) {
          throw new BadRequestException("Question text is required for all questions");
        }

        const questionData: any = {
          quizId: id,
          type: q.type,
          question: q.question.trim(),
          options: Array.isArray(q.options) ? q.options : [],
          required: q.required ?? false,
          points: q.points ?? 1,
          correctAnswers: Array.isArray(q.correctAnswers)
            ? q.correctAnswers
            : q.correctAnswers
            ? [q.correctAnswers]
            : [],
        };
        
        // Handle labeling question specifics
        if (q.type === 'labeling') {
          // For labeling questions, correctAnswers contains the label-answer pairs
          // Make sure options contains labels for labeling questions
          if (!questionData.options.length && Array.isArray(q.correctAnswers)) {
            questionData.options = q.correctAnswers.map(la => 
              typeof la === 'object' && la && 'label' in la ? (la as any).label : String(la)
            );
          }
        }

        if (q.imageUrl) {
          questionData.imageUrl = q.imageUrl;
          console.log(`Question ${q.question?.substring(0, 50)} - Setting imageUrl:`, q.imageUrl);
        } else {
          console.log(`Question ${q.question?.substring(0, 50)} - No imageUrl provided`);
        }
        return questionData;
      }),
    });

    // Fetch the full quiz again after question updates
    const finalQuiz = await tx.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    // Choose message dynamically
    const message =
      data.questions.length === 1
        ? 'Question created successfully'
        : 'Questions created successfully';

    return { message };
  });
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

    const questionData: any = {
      id: q.id,
      type: q.type,
      question: q.question,
      correctAnswers: correctAnswers,
      options: options,
      points: q.points,
      required: q.required,
      quizId: quiz.id,
    };

    // Add imageUrl if present - ensure it's a full URL
    if (q.imageUrl) {
      // Check if it's already a full URL (starts with http/https)
      if (q.imageUrl.startsWith('http://') || q.imageUrl.startsWith('https://')) {
        questionData.imageUrl = q.imageUrl;
      } else {
        // If it's a relative URL, construct the full URL
        const baseUrl = this.configService.get('BACKEND_URL');
        questionData.imageUrl = q.imageUrl.startsWith('/') 
          ? `${baseUrl}${q.imageUrl}`
          : `${baseUrl}/${q.imageUrl}`;
         
      }
    }

    

    // For labeling questions, correctAnswers already contains the label-answer pairs

    return questionData;
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

    console.log(quizUpdateData,"updatedQuiz")

    return {updatedQuiz};
  }

}