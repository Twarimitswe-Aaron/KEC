import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async createRating(userId: number, score: number, feedback?: string) {
    // Find student record for this user
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    // Check if rating already exists for this student
    // Assuming one rating per student for the platform for now
    // Or we can allow multiple, but let's stick to one or update existing
    const existingRating = await this.prisma.rating.findFirst({
      where: { studentId: student.id },
    });

    if (existingRating) {
      return this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { score, feedback },
      });
    }

    return this.prisma.rating.create({
      data: {
        score,
        feedback,
        studentId: student.id,
      },
    });
  }

  async getRating(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) return null;

    return this.prisma.rating.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
