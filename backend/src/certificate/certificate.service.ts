import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class CertificateService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(params: {
    courseId?: number;
    status?: CertificateStatus;
    studentId?: number;
  }) {
    const { courseId, status, studentId } = params;
    return this.prisma.certificates.findMany({
      where: {
        courseId,
        status,
        studentId,
      },
      select: {
        id: true,
        status: true,
        issueDate: true,
        certificateNumber: true,
        rejectionReason: true,
        description: true,
        createdAt: true,
        student: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image_url: true,
            uploader: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        template: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async generateForCourse(courseId: number, studentIds?: number[]) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            user: {
              include: { student: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is ended
    if (course.status !== 'ENDED') {
      throw new Error('Course must be ended to generate certificates');
    }

    // Filter enrollments by studentIds if provided
    const targetEnrollments = studentIds
      ? course.enrollments.filter(
          (e) => e.user.student?.id && studentIds.includes(e.user.student.id),
        )
      : course.enrollments;

    const generatedCertificates: any[] = [];

    for (const enrollment of targetEnrollments) {
      if (!enrollment.user.student) continue;

      // Check if certificate already exists
      const existing = await this.prisma.certificates.findFirst({
        where: {
          courseId,
          studentId: enrollment.user.student.id,
        },
      });

      if (!existing) {
        const cert = await this.prisma.certificates.create({
          data: {
            courseId,
            studentId: enrollment.user.student.id,
            status: CertificateStatus.PENDING,
            templateId: course.certificateTemplateId,
          },
          include: {
            student: {
              include: { user: true },
            },
          },
        });
        generatedCertificates.push(cert);
      }
    }

    return {
      message: `Generated ${generatedCertificates.length} certificates`,
      certificates: generatedCertificates,
    };
  }

  async updateStatus(
    studentId: number,
    courseId: number,
    status: CertificateStatus,
    rejectionReason?: string,
    certificateNumber?: string,
    description?: string,
  ) {
    // First, get the student record to get the studentId for the certificates table
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new Error('Student not found');
    }

    const actualStudentId = user.student.id;

    // Use upsert to create certificate if it doesn't exist
    const certificate = await this.prisma.certificates.upsert({
      where: {
        studentId_courseId: {
          studentId: actualStudentId,
          courseId,
        },
      },
      create: {
        studentId: actualStudentId,
        courseId,
        userId: studentId,
        status,
        issueDate: status === CertificateStatus.APPROVED ? new Date() : null,
        rejectionReason:
          status === CertificateStatus.REJECTED ? rejectionReason : null,
        certificateNumber:
          status === CertificateStatus.APPROVED ? certificateNumber : null,
        description: status === CertificateStatus.APPROVED ? description : null,
      },
      update: {
        status,
        issueDate: status === CertificateStatus.APPROVED ? new Date() : null,
        rejectionReason:
          status === CertificateStatus.REJECTED ? rejectionReason : null,
        certificateNumber:
          status === CertificateStatus.APPROVED ? certificateNumber : null,
        description: status === CertificateStatus.APPROVED ? description : null,
      },
      include: {
        student: {
          include: { user: true },
        },
        course: true,
      },
    });

    // Handle enrollment and student-course relations when certificate is approved
    if (status === CertificateStatus.APPROVED) {
      // Delete the enrollment to remove course access
      await this.prisma.enrollment.deleteMany({
        where: {
          userId: studentId,
          courseId: courseId,
        },
      });

      // Update student-course relations
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          completedStudents: {
            connect: { id: actualStudentId },
          },
          onGoingStudents: {
            disconnect: { id: actualStudentId },
          },
        },
      });
    }

    // Send email if certificate is approved
    if (status === CertificateStatus.APPROVED && certificate.student?.user) {
      try {
        await this.emailService.sendCertificateEmail(
          certificate.student.user.email,
          `${certificate.student.user.firstName} ${certificate.student.user.lastName}`,
          certificate.course.title,
          certificateNumber || `CERT-${certificate.id}`,
          // You can add certificate URL here if you have one
        );
      } catch (error) {
        console.error('Failed to send certificate email:', error);
        // Don't fail the entire operation if email fails
      }
    }

    return certificate;
  }

  async getTemplates() {
    return this.prisma.certificateTemplate.findMany();
  }

  async createTemplate(data: { name: string; content: string }) {
    return this.prisma.certificateTemplate.create({
      data,
    });
  }

  async getEndedCoursesWithStudents() {
    const endedCourses = await this.prisma.course.findMany({
      where: {
        status: 'ENDED',
        isConfirmed: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        certificateDescription: true,
        image_url: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        certificates: {
          select: {
            id: true,
            status: true,
            certificateNumber: true,
            rejectionReason: true,
            issueDate: true,
            description: true,
            createdAt: true,
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profile: {
                      select: {
                        avatar: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return endedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      certificateDescription: course.certificateDescription,
      image_url: course.image_url,
      instructorName: course.uploader
        ? `${course.uploader.firstName} ${course.uploader.lastName}`.trim()
        : 'Instructor',
      students: course.certificates
        .filter((cert) => cert.student && cert.student.user)
        .map((cert) => ({
          id: cert.student!.user!.id, // User ID for compatibility
          studentId: cert.student!.id, // Actual Student ID
          certificateId: cert.id,
          status: cert.status,
          certificateNumber: cert.certificateNumber,
          rejectionReason: cert.rejectionReason,
          issueDate: cert.issueDate,
          description: cert.description,
          createdAt: cert.createdAt,
          name: `${cert.student!.user!.firstName} ${cert.student!.user!.lastName}`.trim(),
          email: cert.student!.user!.email,
          phone: cert.student!.user!.profile?.phone || '',
          avatar: cert.student!.user!.profile?.avatar || null,
        })),
    }));
  }
  async uploadTemplate(
    file: Express.Multer.File,
    courseId?: number,
    name?: string,
  ) {
    const isHtml = file.mimetype === 'text/html';
    let content = '';

    if (isHtml) {
      content = file.buffer.toString('utf-8');
    } else {
      // It's an image, use the URL
      content = `/uploads/certificates/${file.filename}`;
    }

    // Create the template
    const template = await this.prisma.certificateTemplate.create({
      data: {
        name: name || file.originalname,
        content: content,
      },
    });

    // If courseId is provided, link it
    if (courseId) {
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          certificateTemplateId: template.id,
          templateUrl: !isHtml ? content : null, // Store URL directly if it's an image
          templateType: isHtml ? 'HTML' : 'IMAGE',
        },
      });
    }

    return template;
  }
}
