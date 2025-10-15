import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AddResourceDto } from './dto/add-resource.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async getLessonsByCourse(courseId: number) {
    const course = await this.prisma.course.findUnique({ 
      where: { id: courseId } 
    });
    if (!course) throw new NotFoundException('Course not found');

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      include: {
        resources: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.description,
      description: lesson.description,
      courseId: lesson.courseId,
      isUnlocked: lesson.isUnlocked,
      order: lesson.id,
      resources: lesson.resources.map(resource => ({
        id: resource.id,
        url: resource.url,
        title: resource.name || 'Untitled Resource',
        type: resource.type,
        size: resource.size,
        duration: resource.duration,
        uploadedAt: resource.uploadedAt?.toISOString(),
        quiz: resource.quiz ? {
          id: resource.quiz.id,
          name: resource.quiz.name,
          description: resource.quiz.description,
          questions: resource.quiz.questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.parse(q.options) : null,
            required: q.required,
          })),
        } : undefined,
      })),
    }));
  }

  async getLessonById(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        resources: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.description,
      description: lesson.description,
      courseId: lesson.courseId,
      isUnlocked: lesson.isUnlocked,
      order: lesson.id,
      createdAt: lesson.createdAt.toISOString(),

      resources: lesson.resources.map(resource => ({
        id: resource.id,
        url: resource.url,
        title: resource.name || 'Untitled Resource',
        type: resource.type,
        size: resource.size,
        duration: resource.duration,
        uploadedAt: resource.uploadedAt?.toISOString(),
        quiz: resource.quiz ? {
          id: resource.quiz.id,
          name: resource.quiz.name,
          description: resource.quiz.description,
          questions: resource.quiz.questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.parse(q.options) : null,
            required: q.required,
          })),
        } : undefined,
      })),
    };
  }

  async createLesson(dto: CreateLessonDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException("Course not found");

    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseId: dto.courseId,
        isUnlocked: dto.isUnlocked ?? false,
      },
    });

    await this.prisma.course.update({
      where: { id: dto.courseId },
      data: {
        no_lesson: { increment: 1 }
      }
    });

    return {
      message: "Lesson created successfully",
      data: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.description,
        description: lesson.description,
        courseId: lesson.courseId,
        isUnlocked: lesson.isUnlocked,
        order: lesson.id,
      },
      success: true,
    };
  }

  async createModule(courseId: number, dto: CreateLessonDto) {
    dto.courseId = courseId;
    return this.createLesson(dto);
  }

  async updateLesson(id: number, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isUnlocked: dto.isUnlocked,
      },
    });

    return {
      message: "Lesson updated successfully",
      data: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        content: updatedLesson.description,
        description: updatedLesson.description,
        courseId: updatedLesson.courseId,
        isUnlocked: updatedLesson.isUnlocked,
        order: updatedLesson.id,
      },
      success: true,
    };
  }

  async deleteLesson(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Delete all resources first (including quizzes)
    const resources = await this.prisma.resource.findMany({
      where: { lessonId: id },
      include: { quiz: true }
    });

    for (const resource of resources) {
      if (resource.quiz) {
        await this.prisma.quiz.delete({
          where: { id: resource.quiz.id }
        });
      }
    }

    await this.prisma.resource.deleteMany({
      where: { lessonId: id }
    });

    await this.prisma.lesson.delete({
      where: { id },
    });

    await this.prisma.course.update({
      where: { id: lesson.courseId },
      data: {
        no_lesson: { decrement: 1 }
      }
    });

    return {
      message: "Lesson deleted successfully",
      success: true,
    };
  }

  async toggleLessonLock(id: number, dto: ToggleLockDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: Number(id) },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const updatedLesson = await this.prisma.lesson.update({
      where: { id: Number(id) },
      data: { isUnlocked: dto.isUnlocked }
    });

    return {
      message: dto.isUnlocked ? "Lesson unlocked successfully" : "Lesson locked successfully",
      data: {
        id: updatedLesson.id,
        isUnlocked: updatedLesson.isUnlocked,
      },
      success: true,
    };
  }

  async addResource(lessonId: number, dto: AddResourceDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    let url = dto.url;
    let size: string | null = null;

    if (dto.file) {
      url = await this.uploadFile(dto.file);
      size = `${(dto.file.size / 1024 / 1024).toFixed(1)} MB`;
    }

    const resource = await this.prisma.resource.create({
      data: {
        lessonId: lessonId,
        name: dto.title,
        type: dto.type,
        size: size,
        uploadedAt: new Date(),
        url: url,
      },
    });

    return {
      message: "Resource added successfully",
      data: {
        id: resource.id,
        url: resource.url,
        title: resource.name,
        type: resource.type,
        size: resource.size,
        uploadedAt: resource.uploadedAt.toISOString(),
      },
      success: true,
    };
  }

  private async uploadFile(file: Express.Multer.File): Promise<string> {
    // Simple file upload implementation - replace with your actual file storage logic
    const fileName = `${Date.now()}-${file.originalname}`;
    const publicUrl = `/uploads/${fileName}`;
    
    // In a real implementation, you would save the file to disk or cloud storage here
    // For now, we'll just return a placeholder URL
    return publicUrl;
  }

  async deleteResource(lessonId: number, resourceId: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: { quiz: true }
    });
    
    if (!resource) throw new NotFoundException('Resource not found');

    if (resource.lessonId !== lessonId) {
      throw new BadRequestException('Resource does not belong to this lesson');
    }

    // If it's a quiz resource, delete the quiz first
    if (resource.quiz) {
      await this.prisma.quiz.delete({
        where: { id: resource.quiz.id },
      });
    }

    await this.prisma.resource.delete({
      where: { id: resourceId },
    });

    return {
      message: "Resource deleted successfully",
      success: true,
    };
  }

  async reorderLessons(courseId: number, lessonIds: number[]) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const lessons = await this.prisma.lesson.findMany({
      where: { 
        id: { in: lessonIds },
        courseId: courseId 
      },
    });

    if (lessons.length !== lessonIds.length) {
      throw new BadRequestException('Some lessons not found in this course');
    }

    // Update lesson order - since we don't have an order field, we'll update the IDs if needed
    // This is a placeholder implementation
    return {
      message: "Lessons reordered successfully",
      success: true,
    };
  }

  async duplicateLesson(id: number) {
    const originalLesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        resources: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!originalLesson) throw new NotFoundException('Lesson not found');

    const duplicatedLesson = await this.prisma.lesson.create({
      data: {
        title: `${originalLesson.title} (Copy)`,
        description: originalLesson.description,
        courseId: originalLesson.courseId,
        isUnlocked: originalLesson.isUnlocked,
      },
    });

    await this.prisma.course.update({
      where: { id: originalLesson.courseId },
      data: {
        no_lesson: { increment: 1 }
      }
    });

    for (const resource of originalLesson.resources) {
      if (resource.type === 'quiz' && resource.quiz) {
        const duplicatedQuiz = await this.prisma.quiz.create({
          data: {
            name: resource.quiz.name,
            description: resource.quiz.description,
            questions: {
              create: resource.quiz.questions.map(question => ({
                type: question.type,
                question: question.question,
                options: question.options ? JSON.stringify(question.options) : null,
                required: question.required,
              })),
            },
          },
        });

        await this.prisma.resource.create({
          data: {
            lessonId: duplicatedLesson.id,
            name: resource.name,
            type: resource.type,
            quizId: duplicatedQuiz.id,
            url: resource.url,
            size: resource.size,
            uploadedAt: new Date(),
          },
        });
      } else {
        await this.prisma.resource.create({
          data: {
            lessonId: duplicatedLesson.id,
            name: resource.name,
            type: resource.type,
            url: resource.url,
            size: resource.size,
            uploadedAt: new Date(),
          },
        });
      }
    }

    return {
      message: "Lesson duplicated successfully",
      data: {
        id: duplicatedLesson.id,
        title: duplicatedLesson.title,
        content: duplicatedLesson.description,
        description: duplicatedLesson.description,
        courseId: duplicatedLesson.courseId,
        isUnlocked: duplicatedLesson.isUnlocked,
        order: duplicatedLesson.id,
        createdAt: duplicatedLesson.createdAt.toISOString(),
        updatedAt: duplicatedLesson.createdAt.toISOString(),
      },
      success: true,
    };
  }

  async addVideoResource(lessonId: number, dto: CreateVideoDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const resource = await this.prisma.resource.create({
      data: {
        lessonId: lessonId,
        name: dto.name || 'Video Resource',
        type: 'video',
        url: dto.url,
        duration: dto.duration || 'N/A',
        uploadedAt: new Date(),
      },
    });

    return {
      message: "Video resource added successfully",
      data: {
        id: resource.id,
        url: resource.url,
        title: resource.name,
        type: resource.type,
        duration: resource.duration,
        uploadedAt: resource.uploadedAt.toISOString(),
      },
      success: true,
    };
  }

  async addQuizResource(lessonId: number, dto: CreateQuizDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const quiz = await this.prisma.quiz.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        questions: {
          create: dto.questions.map((q: any) => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            required: !!q.required,
          })),
        },
      },
      include: { questions: true },
    });

    const resource = await this.prisma.resource.create({
      data: {
        lessonId: lessonId,
        name: dto.name,
        type: 'quiz',
        quizId: quiz.id,
        uploadedAt: new Date(),
      },
    });

    return {
      message: "Quiz resource added successfully",
      data: {
        id: resource.id,
        title: resource.name,
        type: resource.type,
        uploadedAt: resource.uploadedAt.toISOString(),
        quiz: {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          questions: quiz.questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.parse(q.options) : null,
            required: q.required,
          })),
        },
      },
      success: true,
    };
  }

  async submitQuiz(quizId: number, responses: any[]) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const required = quiz.questions.filter((q) => q.required);
    const answeredRequired = required.filter((req) =>
      responses.some(
        (r) =>
          r.questionId === req.id &&
          (r.answer !== undefined &&
            r.answer !== null &&
            (Array.isArray(r.answer)
              ? r.answer.length > 0
              : ('' + r.answer).trim().length > 0)),
      ),
    );

    if (answeredRequired.length < required.length) {
      throw new BadRequestException('Please answer all required questions');
    }

    await this.prisma.quizAttempt.create({
      data: {
        quizId,
        responses: JSON.stringify(responses),
      },
    });

    return { 
      message: 'Quiz submitted successfully',
      success: true,
    };
  }
}