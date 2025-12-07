import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // Create a new attendance session (teacher only)
  async createSession(courseId: number, teacherId: number, title?: string) {
    // Verify the course exists and teacher has access
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { uploader: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if teacher is the course creator or has admin role
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      throw new ForbiddenException(
        'Only teachers/admins can create attendance sessions',
      );
    }

    // Create the attendance session
    const session = await this.prisma.attendanceSession.create({
      data: {
        courseId,
        createdById: teacherId,
        title: title || 'Attendance',
        status: AttendanceStatus.ACTIVE,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        records: true,
      },
    });

    return {
      message: 'Attendance session created successfully',
      session,
    };
  }

  // Mark attendance for a student
  async markAttendance(sessionId: number, studentId: number) {
    // Verify session exists and is active
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    if (session.status !== AttendanceStatus.ACTIVE) {
      throw new BadRequestException('This attendance session is closed');
    }

    // Verify student is enrolled in the course
    const isEnrolled = session.course.enrollments.some(
      (enrollment) => enrollment.userId === studentId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check if already marked attendance
    const existing = await this.prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });

    if (existing) {
      return {
        message: 'Attendance already marked',
        record: existing,
      };
    }

    // Mark attendance
    const record = await this.prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        present: true,
      },
    });

    return {
      message: 'Attendance marked successfully',
      record,
    };
  }

  // Get attendance records for a session
  async getSessionRecords(sessionId: number, userId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            enrollments: {
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
        },
        records: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    // Get user to check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only teachers/admins can view all records
    if (user.role !== 'admin' && user.role !== 'teacher') {
      throw new ForbiddenException(
        'Only teachers/admins can view attendance records',
      );
    }

    // Build attendance list with all enrolled students
    const attendanceList = session.course.enrollments.map((enrollment) => {
      const record = session.records.find(
        (r) => r.studentId === enrollment.userId,
      );
      return {
        studentId: enrollment.user.id,
        studentName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        email: enrollment.user.email,
        present: !!record,
        markedAt: record?.markedAt || null,
      };
    });

    return {
      session: {
        id: session.id,
        title: session.title,
        courseTitle: session.course.title,
        createdAt: session.createdAt,
        status: session.status,
      },
      attendanceList,
      summary: {
        totalStudents: attendanceList.length,
        present: attendanceList.filter((a) => a.present).length,
        absent: attendanceList.filter((a) => !a.present).length,
      },
    };
  }

  // Get active sessions for a course
  async getActiveSessions(courseId: number) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        courseId,
        status: AttendanceStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        records: true,
      },
    });

    return sessions;
  }

  // Close an attendance session
  async closeSession(sessionId: number, teacherId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    // Verify teacher permissions
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'admin' && user.role !== 'teacher') {
      throw new ForbiddenException('Only teachers/admins can close sessions');
    }

    const updated = await this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: AttendanceStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    return {
      message: 'Attendance session closed',
      session: updated,
    };
  }

  // Get all sessions for a course
  async getCourseSessions(courseId: number) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { courseId },
      include: {
        records: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  }
}
