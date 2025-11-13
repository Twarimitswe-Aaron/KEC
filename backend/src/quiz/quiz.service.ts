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
import { CreateManualQuizDto, UpdateManualMarksDto } from './dto/create-quiz.dto';
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

  async getCoursesWithLessonsAndQuizzes() {
    const courses = await this.prisma.course.findMany({
      where: { isConfirmed: true },
      include: {
        uploader: {
          select: {
            email: true
          }
        },
        lesson: {
          include: {
            resources: {
              include: {
                form: {
                  include: {
                    quizzes: {
                      include: {
                        attempts: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        onGoingStudents: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return courses.map(course => ({
      id: course.id,
      name: course.title,
      code: `COURSE-${course.id}`,
      instructor: course.uploader?.email || 'Unknown',
      semester: 'Current',
      credits: 3,
      lessons: course.lesson.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        quizzes: lesson.resources
          .filter(resource => resource.form?.quizzes && resource.form.quizzes.length > 0)
          .flatMap(resource => resource.form?.quizzes?.map(quiz => ({
            id: quiz.id,
            title: quiz.name,
            type: (quiz.settings as any)?.type || 'online',
            dueDate: quiz.createdAt.toISOString().split('T')[0],
            maxPoints: (quiz.settings as any)?.totalPoints || 100,
            weight: 0.1,
            attempts: quiz.attempts.length,
            isEditable: (quiz.settings as any)?.type === 'manual' || (quiz.settings as any)?.type === 'practical'
          })) || [])
      })),
      enrolledStudents: course.onGoingStudents.map(student => ({
        id: student.user?.id || 0,
        name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
        email: student.user?.email || ''
      }))
    }));
  }

  // Create manual quiz for assignments, practical tests, etc.
  async createManualQuiz(createManualQuizDto: CreateManualQuizDto) {
    try {
      const { name, description, courseId, lessonId, maxPoints, type } = createManualQuizDto;

      // Verify that the lesson and course exist
      const lesson = await this.prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId: courseId
        }
      });

      if (!lesson) {
        throw new NotFoundException('Lesson not found or does not belong to the specified course');
      }

      // Create the quiz using transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create resource
        const resource = await tx.resource.create({
          data: {
            name,
            type: 'quiz',
            lessonId
          }
        });

        // Create form
        const form = await tx.form.create({
          data: {
            resourceId: resource.id
          }
        });

        // Create quiz with manual type settings
        const quiz = await tx.quiz.create({
          data: {
            name,
            description: description || '',
            settings: {
              type: type || 'assignment',
              totalPoints: maxPoints,
              isManual: true,
              allowRetakes: false,
              showResults: true
            },
            formId: form.id
          }
        });

        return { quiz, resource };
      });

      this.logger.log(`Manual quiz created: ${name} for lesson ${lessonId}`);
      return result;

    } catch (error) {
      this.logger.error('Error creating manual quiz:', error);
      throw new BadRequestException('Failed to create manual quiz');
    }
  }

  // Update manual marks for students
  async updateManualMarks(updateManualMarksDto: UpdateManualMarksDto) {
    try {
      const { quizId, studentMarks } = updateManualMarksDto;

      // Verify quiz exists and is manual
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { form: { include: { resource: { include: { lesson: true } } } } }
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      const updates: any[] = [];

      // Process each student mark
      for (const studentMark of studentMarks) {
        const { userId, mark, maxPoints } = studentMark;

        // Note: QuizAttempt in current schema doesn't support userId directly
        // We'll need to create a different approach for manual marks
        // For now, we'll create quiz attempts without user association
        
        // Create quiz attempt record for manual scoring
        const attempt = await this.prisma.quizAttempt.create({
          data: {
            quizId,
            responses: JSON.stringify({ manual: true, userId, mark, maxPoints }),
            score: mark,
            totalPoints: maxPoints,
            detailedResults: JSON.stringify({
              userId,
              isManual: true,
              mark,
              maxPoints,
              percentage: maxPoints > 0 ? (mark / maxPoints) * 100 : 0
            })
          }
        });
        
        updates.push({ userId, action: 'created', mark, attemptId: attempt.id });
      }

      this.logger.log(`Manual marks updated for quiz ${quizId}: ${updates.length} students`);
      return {
        message: `Successfully updated marks for ${updates.length} students`,
        updates
      };

    } catch (error) {
      this.logger.error('Error updating manual marks:', error);
      throw new BadRequestException('Failed to update manual marks');
    }
  }

  // Get quiz participants with their marks
  async getQuizParticipants(quizId: number, courseId: number) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          attempts: true,
          form: {
            include: {
              resource: {
                include: {
                  lesson: {
                    include: {
                      course: {
                        include: {
                          onGoingStudents: {
                            include: {
                              user: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      // Get all enrolled students for the course
      const enrolledStudents = quiz.form?.resource?.lesson?.course?.onGoingStudents?.map(student => ({
        id: student.user?.id || 0,
        name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
        email: student.user?.email || '',
        mark: 0,
        maxPoints: (quiz.settings as any)?.totalPoints || 100,
        percentage: 0,
        submissionDate: '',
        hasSubmitted: false,
        isEditable: true
      })) || [];

      // Update with actual attempt data (parse from detailedResults for manual quizzes)
      const participantsWithMarks = enrolledStudents.map(student => {
        const attempt = quiz.attempts.find(a => {
          try {
            const details = JSON.parse(a.detailedResults || '{}');
            return details.userId === student.id;
          } catch {
            return false;
          }
        });
        
        if (attempt) {
          const percentage = attempt.totalPoints > 0 ? (attempt.score / attempt.totalPoints) * 100 : 0;
          return {
            ...student,
            mark: attempt.score,
            maxPoints: attempt.totalPoints,
            percentage,
            submissionDate: attempt.submittedAt?.toISOString().split('T')[0] || '',
            hasSubmitted: true
          };
        }
        return student;
      });

      return participantsWithMarks;

    } catch (error) {
      this.logger.error('Error getting quiz participants:', error);
      throw new BadRequestException('Failed to get quiz participants');
    }
  }

}