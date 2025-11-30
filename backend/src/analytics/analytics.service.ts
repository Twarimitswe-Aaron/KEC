import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyCourseStats() {
    // Get date from 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch successful payments from the last week grouped by course
    const payments = await this.prisma.payment.groupBy({
      by: ['courseId'],
      where: {
        completedAt: {
          gte: weekAgo,
        },
        status: 'SUCCESSFUL',
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch course details for each payment group
    const courseStats = await Promise.all(
      payments.map(async (payment) => {
        const course = await this.prisma.course.findUnique({
          where: { id: payment.courseId },
          select: {
            id: true,
            title: true,
            image_url: true,
          },
        });

        return {
          id: course?.id?.toString() || payment.courseId.toString(),
          name: course?.title || 'Unknown Course',
          image: course?.image_url || '/images/course.png',
          sales: payment._count?.id || 0,
          earnings: Number(payment._sum?.amount) || 0,
        };
      }),
    );

    // Sort by sales and return top 3
    return courseStats.sort((a, b) => b.sales - a.sales).slice(0, 3);
  }
}
