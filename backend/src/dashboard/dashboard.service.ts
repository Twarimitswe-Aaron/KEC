import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [students, courses, certificates] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.course.count(),
      this.prisma.certificates.count(),
    ]);

    const allCourses = await this.prisma.course.findMany({
      select: { totalPaid: true },
    });

    const revenue = allCourses.reduce((acc, course) => {
      const amount = parseFloat(course.totalPaid || '0');
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);

    // For ongoing and completed, we might need more specific logic based on requirements
    // For now, we'll count total enrollments
    const ongoingCourses = await this.prisma.course.count({
      where: { open: true }, // Assuming 'open' means ongoing
    });

    return {
      revenue,
      rating: 4.5, // Placeholder
      students,
      courses,
      ongoingCourses,
      completedCourses: 0, // Placeholder
      certificates,
      averageScore: 0, // Placeholder
    };
  }

  async getGraphData() {
    // Group revenue by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Since we don't have a transaction table for sales, we'll simulate graph data based on course creation date or similar
    // Ideally, we should have an Order or Transaction model.
    // For now, let's return some data based on created courses as a proxy or just empty if no better data.

    // Attempting to group by month using course creation date
    const courses = await this.prisma.course.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        coursePrice: true,
      },
    });

    const monthlyData = new Map<string, { sales: number; revenue: number }>();

    courses.forEach((course) => {
      const month = course.createdAt.toLocaleString('default', {
        month: 'short',
      });
      const current = monthlyData.get(month) || { sales: 0, revenue: 0 };

      const price = parseFloat(course.coursePrice || '0');

      monthlyData.set(month, {
        sales: current.sales + 1,
        revenue: current.revenue + (isNaN(price) ? 0 : price),
      });
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      sales: data.sales,
      revenue: data.revenue,
    }));
  }

  async getCourses() {
    const courses = await this.prisma.course.findMany({
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            lesson: true,
            onGoingStudents: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      id: course.id.toString(),
      name: course.title,
      description: course.description,
      instructor: course.uploader
        ? `${course.uploader.firstName} ${course.uploader.lastName}`
        : 'Unknown',
      progress: 0, // Logic for progress if needed
      category: course.category || 'Uncategorized',
      students: course._count.onGoingStudents,
      lessons: course._count.lesson,
    }));
  }
}
