import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateStatus } from '@prisma/client';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

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
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
        template: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async generateForCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        completedStudents: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const generatedCertificates: any[] = [];

    for (const student of course.completedStudents) {
      // Check if certificate already exists
      const existing = await this.prisma.certificates.findFirst({
        where: {
          courseId,
          studentId: student.id,
        },
      });

      if (!existing) {
        const cert = await this.prisma.certificates.create({
          data: {
            courseId,
            studentId: student.id,
            status: CertificateStatus.PENDING,
            templateId: course.certificateTemplateId,
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
    id: number,
    status: CertificateStatus,
    rejectionReason?: string,
    certificateNumber?: string,
  ) {
    return this.prisma.certificates.update({
      where: { id },
      data: {
        status,
        issueDate: status === CertificateStatus.APPROVED ? new Date() : null,
        rejectionReason:
          status === CertificateStatus.REJECTED ? rejectionReason : null,
        certificateNumber:
          status === CertificateStatus.APPROVED ? certificateNumber : null,
      },
    });
  }

  async getTemplates() {
    return this.prisma.certificateTemplate.findMany();
  }

  async createTemplate(data: { name: string; content: string }) {
    return this.prisma.certificateTemplate.create({
      data,
    });
  }
}
