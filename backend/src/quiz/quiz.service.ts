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
import {
  CreateManualQuizDto,
  UpdateManualMarksDto,
} from './dto/create-quiz.dto';
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
      questionCount: data.questions?.length || 0,
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
          message: 'Quiz updated successfully',
        };
      }

      // First delete all existing questions for this quiz
      // Delete all existing questions for this quiz
      await tx.quizQuestion.deleteMany({ where: { quizId: id } });

      // Create new questions
      await tx.quizQuestion.createMany({
        data: data.questions.map((q) => {
          if (!q.question?.trim()) {
            throw new BadRequestException(
              'Question text is required for all questions',
            );
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
            if (
              !questionData.options.length &&
              Array.isArray(q.correctAnswers)
            ) {
              questionData.options = q.correctAnswers.map((la) =>
                typeof la === 'object' && la && 'label' in la
                  ? (la as any).label
                  : String(la),
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
      const options =
        typeof q.options === 'string'
          ? JSON.parse(q.options)
          : Array.isArray(q.options)
            ? q.options
            : [];

      // Parse correctAnswers from JSON string if it's a string
      let correctAnswers = [];
      if (q.correctAnswers) {
        correctAnswers =
          typeof q.correctAnswers === 'string'
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
        if (
          q.imageUrl.startsWith('http://') ||
          q.imageUrl.startsWith('https://')
        ) {
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

    const totalPoints = formattedQuestions.reduce(
      (sum, q) => sum + q.points,
      0,
    );
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

  async patchQuizByLessonId({ id, data }: { id: number; data: UpdateQuizDto }) {
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

    console.log(quizUpdateData, 'updatedQuiz');

    return { updatedQuiz };
  }

  async getCoursesWithLessonsAndQuizzes() {
    const courses = await this.prisma.course.findMany({
      where: { isConfirmed: true },
      include: {
        uploader: {
          select: {
            email: true,
          },
        },
        lesson: {
          include: {
            resources: {
              include: {
                form: {
                  include: {
                    quizzes: {
                      include: {
                        attempts: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        onGoingStudents: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return courses.map((course) => ({
      id: course.id,
      name: course.title,
      code: `COURSE-${course.id}`,
      instructor: course.uploader?.email || 'Unknown',
      semester: 'Current',
      credits: 3,
      lessons: course.lesson.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        quizzes: lesson.resources
          .filter(
            (resource) =>
              resource.form?.quizzes && resource.form.quizzes.length > 0,
          )
          .flatMap(
            (resource) =>
              resource.form?.quizzes?.map((quiz) => {
                const settings: any =
                  quiz.settings && typeof quiz.settings === 'object'
                    ? quiz.settings
                    : {};
                const type = settings.type || 'online';
                const maxPoints =
                  typeof settings.totalPoints === 'number' &&
                  settings.totalPoints > 0
                    ? settings.totalPoints
                    : 100;
                const isManual =
                  !!settings.isManual ||
                  [
                    'manual',
                    'practical',
                    'assignment',
                    'project',
                    'lab',
                  ].includes(String(type).toLowerCase());

                // Build students list from enrolled + attempts
                const enrolled = (course.onGoingStudents || []).map((s) => ({
                  studentId: s.user?.id || 0,
                  name: s.user
                    ? `${s.user.firstName} ${s.user.lastName}`
                    : 'Unknown',
                  email: s.user?.email || '',
                }));

                // Map latest attempt per user
                const latestAttemptByUser: Record<number, any> = {};
                for (const a of quiz.attempts || []) {
                  let uid: number | null = null;
                  try {
                    const details = (a as any).detailedResults
                      ? JSON.parse((a as any).detailedResults)
                      : {};
                    if (typeof details.userId === 'number')
                      uid = details.userId;
                  } catch {}
                  if (!uid) continue;
                  const prev = latestAttemptByUser[uid];
                  if (!prev) {
                    latestAttemptByUser[uid] = a;
                  } else {
                    const prevTime = (prev as any).submittedAt
                      ? new Date((prev as any).submittedAt).getTime()
                      : 0;
                    const curTime = (a as any).submittedAt
                      ? new Date((a as any).submittedAt).getTime()
                      : 0;
                    if (
                      curTime > prevTime ||
                      (!(prev as any).submittedAt && (a as any).submittedAt) ||
                      (curTime === prevTime && (a as any).id > (prev as any).id)
                    ) {
                      latestAttemptByUser[uid] = a;
                    }
                  }
                }

                const students = enrolled.map((st) => {
                  const att = latestAttemptByUser[st.studentId];
                  if (att) {
                    const mp = (att as any).totalPoints || maxPoints;
                    const sc = (att as any).score || 0;
                    return {
                      studentId: st.studentId,
                      name: st.name,
                      email: st.email,
                      mark: sc,
                      maxPoints: mp,
                      submissionDate: (att as any).submittedAt
                        ? ((att as any).submittedAt as Date)
                            .toISOString()
                            .split('T')[0]
                        : '',
                      hasSubmitted: true,
                      isEditable: isManual,
                    };
                  }
                  return {
                    studentId: st.studentId,
                    name: st.name,
                    email: st.email,
                    mark: 0,
                    maxPoints,
                    submissionDate: '',
                    hasSubmitted: false,
                    isEditable: isManual,
                  };
                });

                return {
                  id: quiz.id,
                  title: quiz.name,
                  type: type || 'online',
                  dueDate: quiz.createdAt.toISOString().split('T')[0],
                  maxPoints,
                  weight: 0.1,
                  attempts: quiz.attempts.length,
                  isEditable: isManual,
                  students,
                };
              }) || [],
          ),
      })),
      enrolledStudents: course.onGoingStudents.map((student) => ({
        id: student.user?.id || 0,
        name: student.user
          ? `${student.user.firstName} ${student.user.lastName}`
          : 'Unknown',
        email: student.user?.email || '',
      })),
    }));
  }

  // Create manual quiz for assignments, practical tests, etc.
  async createManualQuiz(createManualQuizDto: CreateManualQuizDto) {
    try {
      const { name, description, courseId, lessonId, maxPoints, type } =
        createManualQuizDto;

      // Verify that the lesson and course exist
      const lesson = await this.prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId: courseId,
        },
      });

      if (!lesson) {
        throw new NotFoundException(
          'Lesson not found or does not belong to the specified course',
        );
      }

      // Create the quiz using transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create resource
        const resource = await tx.resource.create({
          data: {
            name,
            type: 'quiz',
            lessonId,
          },
        });

        // Create form
        const form = await tx.form.create({
          data: {
            resourceId: resource.id,
          },
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
              showResults: true,
            },
            formId: form.id,
          },
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
        include: {
          form: { include: { resource: { include: { lesson: true } } } },
        },
      });

      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      const updates: any[] = [];

      // Fetch all existing attempts once for upsert logic
      const existingAttempts = await this.prisma.quizAttempt.findMany({
        where: { quizId },
      });
      // Build a map of latest attempt per userId to avoid repeated scans/JSON parses
      const latestByUser = new Map<number, any>();
      for (const a of existingAttempts) {
        try {
          const details = (a as any).detailedResults
            ? JSON.parse((a as any).detailedResults)
            : {};
          const uid =
            details && typeof details.userId === 'number'
              ? details.userId
              : null;
          if (!uid) continue;
          const prev = latestByUser.get(uid);
          if (!prev) {
            latestByUser.set(uid, a);
          } else {
            const prevTime = (prev as any).submittedAt
              ? new Date((prev as any).submittedAt).getTime()
              : 0;
            const curTime = (a as any).submittedAt
              ? new Date((a as any).submittedAt).getTime()
              : 0;
            if (
              curTime > prevTime ||
              (!(prev as any).submittedAt && (a as any).submittedAt) ||
              (curTime === prevTime && (a as any).id > (prev as any).id)
            ) {
              latestByUser.set(uid, a);
            }
          }
        } catch {}
      }

      // Process each student mark: update existing attempt for the user if present, else create new
      for (const studentMark of studentMarks) {
        const { userId, mark, maxPoints } = studentMark;
        let existingForUser = latestByUser.get(userId);

        const payload = {
          responses: JSON.stringify({ manual: true, userId, mark, maxPoints }),
          score: mark,
          totalPoints: maxPoints,
          detailedResults: JSON.stringify({
            userId,
            isManual: true,
            mark,
            maxPoints,
            percentage: maxPoints > 0 ? (mark / maxPoints) * 100 : 0,
          }),
          submittedAt: new Date(),
        } as any;

        if (existingForUser) {
          const attempt = await this.prisma.quizAttempt.update({
            where: { id: existingForUser.id },
            data: payload,
          });
          updates.push({
            userId,
            action: 'updated',
            mark,
            attemptId: attempt.id,
          });
        } else {
          const attempt = await this.prisma.quizAttempt.create({
            data: { quizId, ...payload },
          });
          updates.push({
            userId,
            action: 'created',
            mark,
            attemptId: attempt.id,
          });
        }
      }

      this.logger.log(
        `Manual marks updated for quiz ${quizId}: ${updates.length} students`,
      );
      return {
        message: `Successfully updated marks for ${updates.length} students`,
        updates,
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
                              user: true,
                            },
                          },
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
        throw new NotFoundException('Quiz not found');
      }

      // Determine manual vs online to control editability
      const settings: any =
        quiz.settings && typeof quiz.settings === 'object' ? quiz.settings : {};
      const type = settings.type || 'online';
      const isManual =
        !!settings.isManual ||
        ['manual', 'practical', 'assignment', 'project', 'lab'].includes(
          String(type).toLowerCase(),
        );

      // Build map of latest attempt per userId (by submittedAt desc, then id desc)
      const latestAttemptByUser: Record<number, any> = {};
      for (const a of quiz.attempts || []) {
        let uid: number | null = null;
        try {
          const details = (a as any).detailedResults
            ? JSON.parse((a as any).detailedResults)
            : {};
          if (typeof details.userId === 'number') uid = details.userId;
        } catch {}
        if (!uid) continue;
        const prev = latestAttemptByUser[uid];
        if (!prev) {
          latestAttemptByUser[uid] = a;
        } else {
          const prevTime = (prev as any).submittedAt
            ? new Date((prev as any).submittedAt).getTime()
            : 0;
          const curTime = (a as any).submittedAt
            ? new Date((a as any).submittedAt).getTime()
            : 0;
          if (
            curTime > prevTime ||
            (!(prev as any).submittedAt && (a as any).submittedAt) ||
            (curTime === prevTime && (a as any).id > (prev as any).id)
          ) {
            latestAttemptByUser[uid] = a;
          }
        }
      }

      // Get all enrolled students for the course
      const enrolledStudents =
        quiz.form?.resource?.lesson?.course?.onGoingStudents?.map(
          (student) => ({
            id: student.user?.id || 0,
            name: student.user
              ? `${student.user.firstName} ${student.user.lastName}`
              : 'Unknown',
            email: student.user?.email || '',
            mark: 0,
            maxPoints: (settings?.totalPoints as any) || 100,
            percentage: 0,
            submissionDate: '',
            hasSubmitted: false,
            isEditable: isManual,
          }),
        ) || [];

      // Update with latest attempt data (parse from detailedResults for manual quizzes)
      const participantsWithMarks = enrolledStudents.map((student) => {
        const attempt = latestAttemptByUser[student.id];

        if (attempt) {
          const percentage =
            attempt.totalPoints > 0
              ? (attempt.score / attempt.totalPoints) * 100
              : 0;
          return {
            ...student,
            mark: attempt.score,
            maxPoints: attempt.totalPoints,
            percentage,
            submissionDate:
              attempt.submittedAt?.toISOString().split('T')[0] || '',
            hasSubmitted: true,
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

  // Create a quiz attempt with auto-grading
  async createAttempt(
    quizId: number,
    responses: Array<{ questionId: number; answer: any }>,
    userId?: number,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: true,
        form: {
          include: {
            resource: {
              include: {
                lesson: {
                  include: {
                    course: { include: { onGoingStudents: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questionById = new Map<number, any>();
    for (const q of quiz.questions) questionById.set(q.id, q);

    const totalPoints = quiz.questions.reduce(
      (sum, q) => sum + (q.points || 0),
      0,
    );
    let score = 0;
    const perQuestion: Record<number, { awarded: number; points: number }> = {};

    const norm = (v: any) =>
      String(v ?? '')
        .trim()
        .toLowerCase();

    for (const r of responses || []) {
      const q = questionById.get(r.questionId);
      if (!q) continue;
      const points = q.points || 0;
      let awarded = 0;
      const type = String(q.type || '').toLowerCase();

      // Normalize options for index-based comparison
      const optionsArr: any[] = Array.isArray(q.options)
        ? q.options
        : typeof q.options === 'string'
          ? (() => {
              try {
                const p = JSON.parse(q.options);
                return Array.isArray(p) ? p : [];
              } catch {
                return [];
              }
            })()
          : [];
      const optIdxMap = new Map<string, number>();
      for (let i = 0; i < optionsArr.length; i++)
        optIdxMap.set(norm(optionsArr[i]), i);
      const idxOfOption = (val: any) => optIdxMap.get(norm(val)) ?? -1;

      let correct: any[] = [];
      if (q.correctAnswers) {
        if (typeof q.correctAnswers === 'string') {
          try {
            const parsed = JSON.parse(q.correctAnswers);
            if (Array.isArray(parsed)) correct = parsed;
          } catch {}
        } else if (Array.isArray(q.correctAnswers)) {
          correct = q.correctAnswers;
        }
      }

      if (type === 'multiple' || type === 'truefalse') {
        const expected = correct.length ? correct[0] : null;
        if (expected !== null) {
          if (typeof expected === 'number') {
            const ansIdx = idxOfOption(r.answer);
            if (ansIdx === expected) awarded = points;
          } else {
            if (norm(r.answer) === norm(expected)) awarded = points;
          }
        }
      } else if (type === 'checkbox') {
        const ansArr = Array.isArray(r.answer) ? r.answer : [r.answer];
        const ansIdx = ansArr
          .map((a: any) => idxOfOption(a))
          .filter((i: number) => i >= 0);
        let corrIdx: number[] = [];
        if (correct.every((c) => typeof c === 'number')) {
          corrIdx = correct as number[];
        } else {
          corrIdx = correct
            .map((c) => idxOfOption(c))
            .filter((i: number) => i >= 0);
        }
        const setA = new Set(ansIdx);
        const setB = new Set(corrIdx);
        if (setA.size === setB.size && [...setA].every((v) => setB.has(v)))
          awarded = points;
      } else if (type === 'labeling') {
        const ans = Array.isArray(r.answer) ? r.answer : [];
        // Build maps label -> answer using lowercase for both sides
        const ansMap = new Map<string, string>();
        for (const a of ans) {
          if (a && typeof a === 'object' && 'label' in a) {
            ansMap.set(norm((a as any).label), norm((a as any).answer));
          }
        }
        const corrMap = new Map<string, string>();
        for (const c of correct || []) {
          if (c && typeof c === 'object' && 'label' in (c as any)) {
            corrMap.set(norm((c as any).label), norm((c as any).answer));
          }
        }
        let ok = ansMap.size === corrMap.size;
        if (ok) {
          for (const [lbl, ansVal] of corrMap.entries()) {
            if (!ansMap.has(lbl) || ansMap.get(lbl) !== ansVal) {
              ok = false;
              break;
            }
          }
        }
        if (ok) awarded = points;
      }

      score += awarded;
      perQuestion[r.questionId] = { awarded, points };
    }

    // Enrollment guard: ensure user is enrolled in the quiz's course
    if (userId) {
      const course = quiz.form?.resource?.lesson?.course as any;
      if (course) {
        let student = await this.prisma.student.findUnique({
          where: { userId },
        });
        if (!student) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });
          if (!user) throw new BadRequestException('User not found');
          if (user.role !== 'student')
            throw new BadRequestException('Only students can attempt quizzes');
          student = await this.prisma.student.create({ data: { userId } });
        }
        const enrolled =
          Array.isArray(course.onGoingStudents) &&
          course.onGoingStudents.some((s: any) => s.id === student.id);
        if (!enrolled) {
          throw new BadRequestException(
            'You must enroll in this course to attempt the quiz',
          );
        }
      }
    }

    // Determine retake policy
    const settings: any =
      typeof quiz.settings === 'object' && quiz.settings !== null
        ? quiz.settings
        : {};
    const allowRetakes = !!settings.allowRetakes;

    // Find an existing attempt for this user (by detailedResults.userId)
    let existingAttempt: any | undefined;
    if (userId && Array.isArray(quiz.attempts)) {
      for (const a of quiz.attempts) {
        try {
          const details = (a as any).detailedResults
            ? JSON.parse((a as any).detailedResults)
            : {};
          if (details && details.userId === userId) {
            existingAttempt = a;
            break;
          }
        } catch {}
      }
    }

    if (existingAttempt && !allowRetakes) {
      throw new BadRequestException('Retakes are not allowed for this quiz');
    }

    const payload = {
      responses: JSON.stringify(responses || []),
      score,
      totalPoints,
      detailedResults: JSON.stringify({
        userId: userId ?? null,
        score,
        totalPoints,
        perQuestion,
      }),
      submittedAt: new Date(),
    };

    if (existingAttempt && allowRetakes) {
      const updated = await this.prisma.quizAttempt.update({
        where: { id: existingAttempt.id },
        data: payload,
      });
      return {
        message: 'Quiz resubmitted successfully',
        score,
        totalPoints,
        attemptId: updated.id,
      };
    }

    const created = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        ...payload,
      },
    });

    return {
      message: 'Quiz submitted successfully',
      score,
      totalPoints,
      attemptId: created.id,
    };
  }

  async getMyAttempt(quizId: number, userId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId },
    });
    let latest: any | null = null;
    for (const a of attempts) {
      try {
        const details = (a as any).detailedResults
          ? JSON.parse((a as any).detailedResults)
          : {};
        if (details && details.userId === userId) {
          if (!latest) {
            latest = a;
          } else {
            const prevTime = (latest as any).submittedAt
              ? new Date((latest as any).submittedAt).getTime()
              : 0;
            const curTime = (a as any).submittedAt
              ? new Date((a as any).submittedAt).getTime()
              : 0;
            if (
              curTime > prevTime ||
              (!(latest as any).submittedAt && (a as any).submittedAt) ||
              (curTime === prevTime && (a as any).id > (latest as any).id)
            ) {
              latest = a;
            }
          }
        }
      } catch {}
    }
    if (!latest) return null;
    const details = (latest as any).detailedResults
      ? JSON.parse((latest as any).detailedResults)
      : {};
    return {
      attemptId: (latest as any).id,
      score: (latest as any).score || 0,
      totalPoints: (latest as any).totalPoints || 0,
      submittedAt: (latest as any).submittedAt?.toISOString?.() || null,
      responses: (latest as any).responses
        ? JSON.parse((latest as any).responses)
        : [],
      perQuestion: details.perQuestion || {},
    };
  }
}
