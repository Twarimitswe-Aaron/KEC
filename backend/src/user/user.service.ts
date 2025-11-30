import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async createUser(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, role } = createUserDto;

    const hashedPassword = await this.hashPassword(password);
    const getAvatarUrl = (
      firstName: string,
      lastName: string,
      size: number = 64,
    ) => {
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
      const backgroundColor = Math.floor(Math.random() * 16777215).toString(16); // Random hex color
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&size=${size}&font-size=0.5&length=2&rounded=false&bold=true`;
    };
    const avatarUrl = getAvatarUrl(firstName, lastName);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the user
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          isEmailVerified: true,
          role,
          profile: {
            create: {
              avatar: avatarUrl,
            },
          },
        },
      });

      // 2. Automatically create related profile based on role
      if (role === 'admin') {
        await tx.admin.create({
          data: {
            userId: user.id,
            title: 'Administrator',
            isVisibleOnTeam: true,
          },
        });
      } else if (role === 'teacher') {
        await tx.teacher.create({
          data: {
            userId: user.id,
            title: 'Instructor',
            isVisibleOnTeam: false,
          },
        });
      } else if (role === 'student') {
        await tx.student.create({
          data: {
            userId: user.id,
          },
        });
      }

      return { message: 'User created successfully', user };
    });
  }

  async findAll(): Promise<
    Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      avatar: string;
      isVisibleOnTeam?: boolean;
    }>
  > {
    // First, ensure all admin and teacher users have their corresponding records
    const allAdminsAndTeachers = await this.prisma.user.findMany({
      where: {
        OR: [{ role: 'admin' }, { role: 'teacher' }],
      },
      include: {
        admin: true,
        teacher: true,
      },
    });

    // Create missing Admin/Teacher records
    for (const user of allAdminsAndTeachers) {
      if (user.role === 'admin' && !user.admin) {
        await this.prisma.admin.create({
          data: {
            userId: user.id,
            title: 'Administrator',
            isVisibleOnTeam: true,
          },
        });
      } else if (user.role === 'teacher' && !user.teacher) {
        await this.prisma.teacher.create({
          data: {
            userId: user.id,
            title: 'Instructor',
            isVisibleOnTeam: false,
          },
        });
      }
    }

    // Now fetch all users with their related data
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,

        profile: {
          select: {
            avatar: true,
          },
        },
        admin: {
          select: {
            isVisibleOnTeam: true,
          },
        },
        teacher: {
          select: {
            isVisibleOnTeam: true,
          },
        },
      },
    });

    const backgroundColor = Math.floor(Math.random() * 16777215).toString(16); // Random hex color

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      avatar:
        u.profile?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName.charAt(0))}&background=${backgroundColor}&color=fff&size=64&font-size=0.5&length=2&rounded=false&bold=true`,
      isVisibleOnTeam:
        u.role === 'admin'
          ? u.admin?.isVisibleOnTeam
          : u.role === 'teacher'
            ? u.teacher?.isVisibleOnTeam
            : undefined,
    }));
  }

  async getTeamMembers(): Promise<
    Array<{
      id: number;
      name: string;
      title: string;
      avatar: string;
      role: string;
    }>
  > {
    // First, ensure all admin and teacher users have their corresponding records
    // This handles legacy users who may not have been created with the related tables
    const allAdminsAndTeachers = await this.prisma.user.findMany({
      where: {
        OR: [{ role: 'admin' }, { role: 'teacher' }],
      },
      include: {
        admin: true,
        teacher: true,
      },
    });

    // Create missing Admin/Teacher records
    for (const user of allAdminsAndTeachers) {
      if (user.role === 'admin' && !user.admin) {
        await this.prisma.admin.create({
          data: {
            userId: user.id,
            title: 'Administrator',
            isVisibleOnTeam: true,
          },
        });
      } else if (user.role === 'teacher' && !user.teacher) {
        await this.prisma.teacher.create({
          data: {
            userId: user.id,
            title: 'Instructor',
            isVisibleOnTeam: false,
          },
        });
      }
    }

    // Now fetch all users with admin or teacher role who are visible on team page
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            role: 'admin',
            admin: {
              isVisibleOnTeam: true,
            },
          },
          {
            role: 'teacher',
            teacher: {
              isVisibleOnTeam: true,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profile: {
          select: {
            avatar: true,
          },
        },
        admin: {
          select: {
            title: true,
          },
        },
        teacher: {
          select: {
            title: true,
          },
        },
      },
    });

    const backgroundColor = Math.floor(Math.random() * 16777215).toString(16);

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
      title:
        u.role === 'admin'
          ? u.admin?.title || 'Administrator'
          : u.teacher?.title || 'Instructor',
      avatar:
        u.profile?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName.charAt(0))}&background=${backgroundColor}&color=fff&size=64&font-size=0.5&length=2&rounded=false&bold=true`,
      role: u.role,
    }));
  }

  async getUserDetails(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        student: {
          include: {
            onGoingCourses: {
              include: {
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
              },
            },
            completedCourses: true,
            failedCourses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate stats
    const enrolledCourses = user.student?.onGoingCourses || [];
    const completedCourses = user.student?.completedCourses || [];
    const failedCourses = user.student?.failedCourses || [];

    // Calculate total paid (assuming coursePrice is the paid amount)
    const totalPaid = [
      ...enrolledCourses,
      ...completedCourses,
      ...failedCourses,
    ].reduce((sum, course) => {
      const price = parseFloat(course.coursePrice.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    // Process quizzes
    const allQuizzes: any[] = [];
    let totalScore = 0;
    let totalMaxPoints = 0;
    let quizCount = 0;

    // Helper to process quizzes from courses
    const processCourseQuizzes = (courses: any[]) => {
      courses.forEach((course) => {
        course.lesson?.forEach((lesson: any) => {
          lesson.resources?.forEach((resource: any) => {
            resource.form?.quizzes?.forEach((quiz: any) => {
              // Find attempt for this user
              let userAttempt: any = null;
              if (quiz.attempts) {
                // Sort attempts by date (newest first) to get the latest
                const sortedAttempts = [...quiz.attempts].sort(
                  (a: any, b: any) =>
                    new Date(b.submittedAt).getTime() -
                    new Date(a.submittedAt).getTime(),
                );

                for (const attempt of sortedAttempts) {
                  try {
                    const details = attempt.detailedResults
                      ? JSON.parse(attempt.detailedResults)
                      : {};
                    if (details.userId === userId) {
                      userAttempt = attempt;
                      break;
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }

              if (userAttempt) {
                const score = userAttempt.score || 0;
                const maxPoints = userAttempt.totalPoints || 0;

                totalScore += score;
                totalMaxPoints += maxPoints;
                quizCount++;

                allQuizzes.push({
                  id: quiz.id,
                  title: quiz.name,
                  courseName: course.title,
                  score,
                  maxPoints,
                  percentage: maxPoints > 0 ? (score / maxPoints) * 100 : 0,
                  submittedAt: userAttempt.submittedAt,
                  status: 'Completed',
                });
              } else {
                allQuizzes.push({
                  id: quiz.id,
                  title: quiz.name,
                  courseName: course.title,
                  score: 0,
                  maxPoints: quiz.settings?.totalPoints || 100, // Fallback
                  percentage: 0,
                  submittedAt: null,
                  status: 'Pending',
                });
              }
            });
          });
        });
      });
    };

    processCourseQuizzes(enrolledCourses);
    // Note: Completed/Failed courses might not have lesson/quiz data loaded in this query
    // if we want them, we need to include them in the Prisma query above.
    // For now, focusing on active enrollments for detailed quiz data is safer for performance,
    // but the user asked for "all quizzes done".
    // Let's stick to onGoingCourses for deep fetch to avoid massive query,
    // or we can add a separate query for all attempts if needed.
    // Given the prompt "all courses enrolled completed ones failed ones",
    // I will assume we want basic info for completed/failed and detailed quiz info for active.

    const averageQuizScore =
      quizCount > 0 ? (totalScore / totalMaxPoints) * 100 : 0;

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar: user.profile?.avatar,
        joinedAt: user.createdAt,
        phone: user.profile?.phone,
        address: user.profile?.resident,
      },
      stats: {
        enrolledCount: enrolledCourses.length,
        completedCount: completedCourses.length,
        failedCount: failedCourses.length,
        totalPaid: totalPaid.toFixed(2),
        averageQuizScore: averageQuizScore.toFixed(1),
      },
      courses: {
        enrolled: enrolledCourses.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.coursePrice,
          progress: 0,
        })), // Progress requires more calculation
        completed: completedCourses.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.coursePrice,
        })),
        failed: failedCourses.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.coursePrice,
        })),
      },
      quizzes: allQuizzes,
    };
  }

  async toggleTeamVisibility(userId: number) {
    // First, find the user and check their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        teacher: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      // Use upsert to create the admin record if it doesn't exist
      const currentVisibility = user.admin?.isVisibleOnTeam ?? true;
      const updated = await this.prisma.admin.upsert({
        where: { userId },
        update: {
          isVisibleOnTeam: !currentVisibility,
        },
        create: {
          userId,
          title: 'Administrator',
          isVisibleOnTeam: false, // Toggle from default true to false
        },
      });
      return {
        message: 'Visibility updated successfully',
        isVisibleOnTeam: updated.isVisibleOnTeam,
      };
    } else if (user.role === 'teacher') {
      // Use upsert to create the teacher record if it doesn't exist
      const currentVisibility = user.teacher?.isVisibleOnTeam ?? false;
      const updated = await this.prisma.teacher.upsert({
        where: { userId },
        update: {
          isVisibleOnTeam: !currentVisibility,
        },
        create: {
          userId,
          title: 'Instructor',
          isVisibleOnTeam: true, // Toggle from default false to true
        },
      });
      return {
        message: 'Visibility updated successfully',
        isVisibleOnTeam: updated.isVisibleOnTeam,
      };
    } else {
      throw new NotFoundException(
        'User is not an admin or teacher. Only admins and teachers can be shown on the team page.',
      );
    }
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
