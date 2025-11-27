import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmCourseDto } from './dto/confirm-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCourseDto: CreateCourseDto) {
    const { id, image_url, title, description, price, uploader, category } =
      createCourseDto;
    const uploaderObj =
      typeof uploader === 'string' ? JSON.parse(uploader) : uploader;

    const newCourse = await this.prisma.course.create({
      data: {
        uploaderId: uploaderObj.id,
        title,
        image_url,
        description,
        category: category || null,
        coursePrice: price,
        no_lesson: 0,
      },
    });
    return newCourse;
  }

  async getCourseById(id: number, userId?: number, userRole?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            resources: {
              include: {
                form: {
                  include: {
                    quizzes: {
                      include: {
                        questions: true, // include quiz questions
                      },
                    },
                  },
                },
              },
            },
          },
        },
        uploader: {
          include: { profile: true },
        },
      },
    });

    if (!course) {
      return { message: 'Course not found' };
    }

    // Determine if user can see all lessons (locked + unlocked)
    const isOwner = course.uploaderId === userId;
    const isAdmin = userRole === 'admin';
    const canSeeAll = isOwner || isAdmin;

    // Helper function for date formatting
    const formatDate = (date: Date) =>
      new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    // Filter lessons based on authorization
    const visibleLessons = canSeeAll
      ? course.lesson
      : course.lesson.filter((l) => l.isUnlocked);

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      certificateDescription: course.certificateDescription,
      category: course.category || null,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: visibleLessons.length,
      open: course.open,
      isConfirmed: course.isConfirmed,
      maximum: course.maximum,
      createdAt: formatDate(course.createdAt),
      updatedAt: formatDate(course.updatedAt),
      status: course.status,

      lesson: visibleLessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        isUnlocked: l.isUnlocked,
        createdAt: formatDate(l.createdAt),

        resources: l.resources.map((r) => {
          const resourceData: any = {
            id: r.id,
            name: r.name,
            lessonId: r.lessonId,
            type: r.type,
            size: r.size,
            createdAt: formatDate(r.uploadedAt),
            url: r.url,
          };
          if (r.form) {
            resourceData.form = {
              id: r.form.id,
              createdAt: formatDate(r.form.createdAt),

              quizzes: r.form.quizzes?.map((q) => ({
                id: q.id,
                name: q.name,
                description: q.description,
                createdAt: formatDate(q.createdAt),
                updatedAt: formatDate(q.updatedAt),

                // include quiz questions
                questions: q.questions?.map((qq) => ({
                  id: qq.id,
                  type: qq.type,
                  question: qq.question,
                  required: qq.required,
                  points: qq.points,
                })),
              })),
            };
          }

          return resourceData;
        }),
      })),

      uploader: {
        id: course.uploaderId,
        name: `${course.uploader?.firstName ?? ''} ${course.uploader?.lastName ?? ''}`.trim(),
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    };
  }

  async confirmCourse(confirmCourseDto: ConfirmCourseDto) {
    const { id } = confirmCourseDto;
    const course = await this.prisma.course.update({
      where: { id },
      data: { isConfirmed: true },
    });
    return { message: 'Course confirmed successfully' };
  }
  async deleteCourse(confirmCourseDto: ConfirmCourseDto) {
    const { id } = confirmCourseDto;
    const course = await this.prisma.course.delete({
      where: { id },
    });
    return { message: 'Course deleted successfully' };
  }

  async findAllUploaded(userId?: number, userRole?: string) {
    // Return all confirmed courses (teachers see all courses)
    // Frontend will handle read-only mode for non-creators
    const whereClause: any = { isConfirmed: true };

    const getAllUploaded = await this.prisma.course.findMany({
      where: whereClause,
      include: { uploader: { include: { profile: true } } },
    });

    console.log(
      'Debug: findAllUploaded courses:',
      getAllUploaded.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
      })),
    );

    return getAllUploaded.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      certificateDescription: course.certificateDescription,
      category: course.category || null,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: '0',
      open: course.open,
      status: course.status,
      templateUrl: course.templateUrl, // Also adding template info for certificate management
      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    }));
  }

  async findAllUnconfirmed() {
    const unconfirmedCourses = await this.prisma.course.findMany({
      where: { isConfirmed: false },
      include: { uploader: { include: { profile: true } } },
    });

    return unconfirmedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      certificateDescription: course.certificateDescription,
      category: course.category || null,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: '0',
      open: course.open,
      status: course.status,
      templateUrl: course.templateUrl,
      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    }));
  }

  async updateCourse(updateCourseDto: UpdateCourseDto) {
    const {
      title,
      description,
      price,
      image_url,
      maximum,
      open,
      category,
      certificateDescription,
    } = updateCourseDto;
    await this.prisma.course.update({
      where: { id: Number(updateCourseDto.id) },
      data: {
        title,
        description,
        category: category ?? undefined,
        coursePrice: price,
        image_url,
        maximum: Number(maximum),
        open: Boolean(open),
        certificateDescription,
      },
    });
    return { message: 'Course updated successfully' };
  }

  async getCoursesWithStudents() {
    const courses = await this.prisma.course.findMany({
      where: { isConfirmed: true },
      include: {
        enrollments: {
          include: {
            user: { include: { profile: true } },
            payment: true, // Include payment information
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      image_url: course.image_url,
      status: course.status, // Include status to filter for ended courses
      students: (course.enrollments || []).map((enrollment) => ({
        id: enrollment.user?.id || 0,
        name: `${enrollment.user?.firstName ?? ''} ${enrollment.user?.lastName ?? ''}`.trim(),
        email: enrollment.user?.email || '',
        phone: enrollment.user?.profile?.phone || '',
        paid: enrollment.payment?.status === 'SUCCESSFUL', // Check if payment was successful
        course: course.title,
        location:
          enrollment.payment?.location ||
          enrollment.user?.profile?.resident ||
          '', // Use payment location if available, fallback to profile resident
      })),
    }));
  }

  async getCourseAnalytics(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lesson: {
          include: {
            resources: {
              include: {
                form: {
                  include: {
                    quizzes: {
                      include: { attempts: true },
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

    if (!course) throw new NotFoundException('Course not found');

    const totalLessons = course.lesson.length;
    let totalAssignments = 0;

    const enrolled = course.onGoingStudents.map((s) => ({
      id: s.user?.id || 0,
      name: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim(),
      email: s.user?.email || '',
    }));

    const studentsById: Record<
      number,
      {
        name: string;
        email: string;
        assignmentsCompleted: number;
        totalAssignments: number;
        sumPerc: number;
        countPerc: number;
      }
    > = {};

    enrolled.forEach((s) => {
      if (s.id) {
        studentsById[s.id] = {
          name: s.name,
          email: s.email,
          assignmentsCompleted: 0,
          totalAssignments: 0,
          sumPerc: 0,
          countPerc: 0,
        };
      }
    });

    const lessonsAnalytics = course.lesson.map((lesson) => {
      let assignmentCount = 0;
      let sumPerc = 0;
      let countPerc = 0;
      let submissions = 0;
      const perStudent: Record<number, { sum: number; cnt: number }> = {};

      (lesson.resources || []).forEach((r) => {
        const quizzes = r.form?.quizzes || [];
        assignmentCount += quizzes.length;
        totalAssignments += quizzes.length;
        quizzes.forEach((q) => {
          const totalPts = (q.settings as any)?.totalPoints || 100;
          (q.attempts || []).forEach((a) => {
            let userId: number | null = null;
            let mark: number | null =
              typeof (a as any).score === 'number' ? (a as any).score : null;
            let maxPoints: number =
              typeof (a as any).totalPoints === 'number' &&
              (a as any).totalPoints > 0
                ? (a as any).totalPoints
                : totalPts;

            try {
              const details = (a as any).detailedResults
                ? JSON.parse((a as any).detailedResults)
                : {};
              if (typeof details.userId === 'number') userId = details.userId;
              if (mark === null && typeof details.mark === 'number')
                mark = details.mark;
              if (
                (!maxPoints || maxPoints <= 0) &&
                typeof details.maxPoints === 'number'
              )
                maxPoints = details.maxPoints;
            } catch {}

            if (userId && mark !== null && maxPoints > 0) {
              const perc = (mark / maxPoints) * 100;
              sumPerc += perc;
              countPerc += 1;
              submissions += 1;

              if (!studentsById[userId]) {
                const found = enrolled.find((e) => e.id === userId) || {
                  id: userId,
                  name: '',
                  email: '',
                };
                studentsById[userId] = {
                  name: found.name,
                  email: found.email,
                  assignmentsCompleted: 0,
                  totalAssignments: 0,
                  sumPerc: 0,
                  countPerc: 0,
                };
              }
              studentsById[userId].assignmentsCompleted += 1;
              studentsById[userId].sumPerc += perc;
              studentsById[userId].countPerc += 1;

              if (!perStudent[userId]) perStudent[userId] = { sum: 0, cnt: 0 };
              perStudent[userId].sum += perc;
              perStudent[userId].cnt += 1;
            }
          });
        });
      });

      const averagePerformance = countPerc > 0 ? sumPerc / countPerc : 0;
      const totalStudents = enrolled.length || Object.keys(studentsById).length;
      const completionRate =
        totalStudents > 0 && assignmentCount > 0
          ? (submissions / (totalStudents * assignmentCount)) * 100
          : 0;
      const studentsAtRisk = Object.values(perStudent).filter(
        (v) => v.cnt > 0 && v.sum / v.cnt < 65,
      ).length;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        assignmentCount,
        averagePerformance,
        completionRate,
        studentsAtRisk,
        quizStats: [],
      };
    });

    Object.values(studentsById).forEach((s) => {
      s.totalAssignments = totalAssignments;
    });

    const topPerformingStudents = Object.entries(studentsById).map(
      ([id, s]) => {
        const overallAverage = s.countPerc > 0 ? s.sumPerc / s.countPerc : 0;
        const letterGrade =
          overallAverage >= 85
            ? 'A'
            : overallAverage >= 70
              ? 'B'
              : overallAverage >= 60
                ? 'C'
                : overallAverage >= 50
                  ? 'D'
                  : 'F';
        return {
          studentId: Number(id),
          name: s.name,
          email: s.email,
          overallAverage,
          letterGrade,
          assignmentsCompleted: s.assignmentsCompleted,
          totalAssignments: s.totalAssignments,
          lessonsProgress: [],
        };
      },
    );

    const courseAverage =
      topPerformingStudents.length > 0
        ? topPerformingStudents.reduce(
            (acc, st) => acc + st.overallAverage,
            0,
          ) / topPerformingStudents.length
        : 0;

    const totalStudentsCount = enrolled.length || topPerformingStudents.length;
    const totalSubmissions = topPerformingStudents.reduce(
      (acc, st) => acc + st.assignmentsCompleted,
      0,
    );
    const overallCompletionRate =
      totalStudentsCount > 0 && totalAssignments > 0
        ? (totalSubmissions / (totalStudentsCount * totalAssignments)) * 100
        : 0;
    const studentsAtRiskCount = topPerformingStudents.filter(
      (s) => s.overallAverage < 65,
    ).length;

    const gradeDistribution = topPerformingStudents.reduce(
      (acc: any, s) => {
        const g = s.letterGrade.startsWith('A')
          ? 'A'
          : s.letterGrade.startsWith('B')
            ? 'B'
            : s.letterGrade.startsWith('C')
              ? 'C'
              : s.letterGrade.startsWith('D')
                ? 'D'
                : 'F';
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      },
      { A: 0, B: 0, C: 0, D: 0, F: 0 },
    );

    return {
      totalLessons,
      totalAssignments,
      totalStudents: totalStudentsCount,
      courseAverage,
      completionRate: overallCompletionRate,
      studentsAtRisk: studentsAtRiskCount,
      lessonsAnalytics,
      topPerformingStudents,
      assignmentTypeBreakdown: [],
      gradeDistribution,
    };
  }

  // Student-facing helpers
  async getStudentCourses(userId: number) {
    let student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role === 'student') {
        student = await this.prisma.student.create({ data: { userId } });
      }
    }
    const studentId = student?.id || 0;

    const courses = await this.prisma.course.findMany({
      where: { isConfirmed: true },
      include: {
        uploader: { include: { profile: true } },
        lesson: true,
        onGoingStudents: true,
        completedStudents: true,
        failedStudents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get certificates for this user
    const certificates = await this.prisma.certificates.findMany({
      where: { userId },
      select: { courseId: true, status: true },
    });

    const certificateMap = new Map(
      certificates.map((c) => [c.courseId, c.status]),
    );

    return courses.map((course) => {
      const isEnrolled = course.onGoingStudents.some((s) => s.id === studentId);
      const isCompleted = course.completedStudents.some(
        (s) => s.id === studentId,
      );
      const isFailed = course.failedStudents.some((s) => s.id === studentId);
      const certificateStatus = certificateMap.get(course.id);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category || null,
        price: course.coursePrice,
        image_url: course.image_url,
        no_lessons: course.lesson.length.toString(),
        open: course.open,
        status: course.status,
        enrolled: isEnrolled,
        completed: isCompleted,
        failed: isFailed,
        certificateStatus,
        uploader: {
          id: course.uploader?.id,
          name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
          email: course.uploader?.email,
          avatar_url: course.uploader?.profile?.avatar || '',
        },
      };
    });
  }

  async getCourseForStudent(id: number) {
    // Reuse admin course view but only return unlocked lessons
    const full = await this.getCourseById(id);
    if ((full as any).message === 'Course not found')
      throw new NotFoundException('Course not found');

    return {
      ...full,
      lesson: (full as any).lesson.filter((l: any) => l.isUnlocked),
    };
  }

  async getStudentEnrollmentStatus(userId: number, courseId: number) {
    let student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.role !== 'student')
        throw new BadRequestException('Only students allowed');
      student = await this.prisma.student.create({ data: { userId } });
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { onGoingStudents: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const enrolled = !!course.onGoingStudents.find((s) => s.id === student.id);
    return { enrolled, open: !!course.open };
  }

  async enrollStudent(userId: number, courseId: number) {
    let student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.role !== 'student')
        throw new BadRequestException('Only students can enroll');
      student = await this.prisma.student.create({ data: { userId } });
    }

    // Check if student already completed this course
    const existingCompletion = await this.prisma.certificates.findFirst({
      where: {
        userId,
        courseId,
        status: { in: ['APPROVED', 'REJECTED'] },
      },
    });

    if (existingCompletion) {
      throw new BadRequestException(
        'You have already completed this course and cannot re-enroll.',
      );
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { onGoingStudents: { select: { id: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.open) throw new BadRequestException('Course is closed');

    const already = course.onGoingStudents.some((s) => s.id === student.id);
    if (already) {
      return { message: 'Already enrolled' };
    }

    // Track session when enrolling
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        onGoingStudents: {
          connect: { id: student.id },
        },
      },
    });

    // Create enrollment record with sessionId
    await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        sessionId: course.sessionId,
      },
    });

    return { message: 'Enrolled successfully' };
  }

  // ========== Course Lifecycle Management ==========

  async uploadCourseTemplate(
    courseId: number,
    templateUrl: string,
    templateType: string,
    filePath?: string,
  ) {
    let templateContent = '';

    // If it's an HTML file, read the content
    if (
      filePath &&
      (templateType === 'text/html' ||
        templateType === 'application/xhtml+xml' ||
        templateUrl.endsWith('.html'))
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const util = require('util');
        const readFile = util.promisify(fs.readFile);
        templateContent = await readFile(filePath, 'utf8');
      } catch (error) {
        console.error('Error reading template file:', error);
      }
    }

    // Create or update CertificateTemplate if we have content
    let templateId: number | null = null;
    if (templateContent) {
      const template = await this.prisma.certificateTemplate.create({
        data: {
          name: `Template for Course ${courseId}`,
          content: templateContent,
        },
      });
      templateId = template.id;
    }

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        templateUrl,
        templateType,
        certificateTemplateId: templateId, // Link the created template
      },
    });

    return {
      message: 'Template uploaded successfully',
      templateUrl: course.templateUrl,
      templateType: course.templateType,
      templateId: course.certificateTemplateId,
    };
  }

  async getCourseTemplate(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        templateUrl: true,
        templateType: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      templateUrl: course.templateUrl,
      templateType: course.templateType,
    };
  }

  async canStudentAccessCourse(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: { userId },
        },
      },
    });

    if (!course || !course.enrollments.length) {
      return false;
    }

    const enrollment = course.enrollments[0];

    // Student can access if enrolled in current session
    // or if no sessionId is set (backward compatibility)
    // or if course is ENDED but certificate is not yet issued

    const sessionMatches =
      !course.sessionId ||
      !enrollment.sessionId ||
      enrollment.sessionId === course.sessionId;

    if (!sessionMatches) return false;

    // If course is ACTIVE, allow access
    if (course.status === 'ACTIVE') return true;

    // If course is ENDED, check certificate status
    // Allow access only if certificate is NOT issued (i.e. PENDING or no certificate)
    if (course.status === 'ENDED') {
      const certificate = await this.prisma.certificates.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      // Allow access if no certificate yet OR certificate is still PENDING
      // If APPROVED or REJECTED, access is revoked
      return !certificate || certificate.status === 'PENDING';
    }

    return false;
  }

  async getPendingCertificatesCount(courseId: number) {
    return await this.prisma.certificates.count({
      where: {
        courseId,
        status: 'PENDING',
      },
    });
  }

  async startCourse(courseId: number) {
    // Check for pending certificates
    const pendingCertificates =
      await this.getPendingCertificatesCount(courseId);

    if (pendingCertificates > 0) {
      throw new BadRequestException(
        `Cannot start course: ${pendingCertificates} students are waiting for certificates from the previous session.`,
      );
    }

    // ALWAYS generate new sessionId (isolate sessions)
    const sessionId = `session_${Date.now()}_${courseId}`;

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        sessionId, // ← NEW session every time
        endDate: null,
      },
    });

    return {
      message: 'Course started with new session',
      course,
      sessionId,
    };
  }

  async stopCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        onGoingStudents: true,
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        sessionId: course.sessionId,
      },
      include: { user: { include: { student: true } } },
    });

    // Move students to completedStudents
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'ENDED',
        endDate: new Date(),
        completedStudents: {
          connect: course.onGoingStudents.map((s) => ({ id: s.id })),
        },
        onGoingStudents: {
          disconnect: course.onGoingStudents.map((s) => ({ id: s.id })),
        },
      },
    });

    // Create certificate records for all enrolled students
    const certificatePromises = enrollments
      .filter((enrollment) => enrollment.user?.student?.id) // Ensure student record exists
      .map((enrollment) =>
        this.prisma.certificates.upsert({
          where: {
            studentId_courseId: {
              studentId: enrollment.user!.student!.id,
              courseId,
            },
          },
          create: {
            studentId: enrollment.user!.student!.id,
            courseId,
            userId: enrollment.userId,
            status: 'PENDING',
          },
          update: {}, // Don't overwrite existing certificates
        }),
      );

    await Promise.all(certificatePromises);

    return {
      message: 'Course stopped, students moved to completed',
      studentsAffected: enrollments.length,
    };
  }
}
