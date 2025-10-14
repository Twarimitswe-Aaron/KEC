import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all modules for a specific course
   */
  // async listModulesByCourse(courseId: number) {
  //   const course = await this.prisma.course.findUnique({ where: { id: courseId } });
  //   if (!course) throw new NotFoundException('Course not found');

  //   return this.prisma.module.findMany({
  //     where: { courseId },
  //     include: {
  //       resources: {
  //         include: {
  //           quiz: { include: { questions: true } },
  //         },
  //       },
  //     },
  //     orderBy: { order: 'asc' },
  //   });
  // }

  /**
   * Create a module under a specific course
   */
  async createModule(courseId: number, dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    // Get the count of existing lessons to determine order
    const lessonCount = await this.prisma.lesson.count({
      where: { courseId },
    });
    const order = dto.order ?? (lessonCount + 1);

    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        courseId,
      },
    });
  }

  /**
   * Toggle module lock/unlock
   */
  // async toggleLock(courseId: number, moduleId: number) {
  //   const course = await this.prisma.course.findUnique({ where: { id: courseId } });
  //   if (!course) throw new NotFoundException('Course not found');

  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new NotFoundException('Module not found in this course');

  //   return this.prisma.module.update({
  //     where: { id: moduleId },
  //     data: { isUnlocked: !mod.isUnlocked },
  //   });
  // }

  /**
   * Delete a module from a course
   */
  // async deleteModuleFromCourse(courseId: number, moduleId: number) {
  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new NotFoundException('Module not found in this course');

  //   // Remove all resources first
  //   await this.prisma.resource.deleteMany({ where: { moduleId } });

  //   return this.prisma.module.delete({ where: { id: moduleId } });
  // }

  /**
   * Add a file resource (PDF/Word) to a module
   */
  // async addFileResourceToCourseModule(
  //   courseId: number,
  //   moduleId: number,
  //   filePath: string,
  //   originalName: string,
  //   type: 'pdf' | 'word',
  //   mimeSizeLabel?: string,
  // ) {
  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new NotFoundException('Module not found in this course');

  //   return this.prisma.resource.create({
  //     data: {
  //       moduleId,
  //       name: originalName,
  //       type,
  //       size: mimeSizeLabel ?? null,
  //       url: filePath,
  //     },
  //   });
  // }

  /**
   * Add a video resource to a module
   */
  // async addVideoResourceToCourseModule(courseId: number, moduleId: number, dto: CreateVideoDto) {
  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new NotFoundException('Module not found in this course');

  //   return this.prisma.resource.create({
  //     data: {
  //       moduleId,
  //       name: dto.name ?? 'Video Resource',
  //       type: 'video',
  //       url: dto.url,
  //     },
  //   });
  // }

  /**
   * Add a quiz resource to a module
   */
  // async addQuizResourceToCourseModule(courseId: number, moduleId: number, dto: CreateQuizDto) {
  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new NotFoundException('Module not found in this course');

  //   // Create quiz with questions
  //   const quiz = await this.prisma.quiz.create({
  //     data: {
  //       name: dto.name,
  //       description: dto.description ?? '',
  //       questions: {
  //         create: dto.questions.map((q: any) => ({
  //           type: q.type,
  //           question: q.question,
  //           options: q.options ? JSON.stringify(q.options) : null,
  //           required: !!q.required,
  //         })),
  //       },
  //     },
  //     include: { questions: true },
  //   });

  //   return this.prisma.resource.create({
  //     data: {
  //       moduleId,
  //       name: dto.name,
  //       type: 'quiz',
  //       quizId: quiz.id,
  //     },
  //     include: { quiz: true },
  //   });
  // }

  /**
   * Remove a resource from a module
   */
  // async removeResourceFromCourseModule(courseId: number, moduleId: number, resourceId: number) {
  //   const res = await this.prisma.resource.findUnique({ where: { id: resourceId } });
  //   if (!res) throw new NotFoundException('Resource not found');

  //   const mod = await this.prisma.module.findFirst({
  //     where: { id: moduleId, courseId },
  //   });
  //   if (!mod) throw new BadRequestException('Module not found in this course');

  //   if (res.moduleId !== moduleId)
  //     throw new BadRequestException('Resource does not belong to this module');

  //   if (res.quizId) {
  //     await this.prisma.quiz.delete({ where: { id: res.quizId } });
  //   }

  //   await this.prisma.resource.delete({ where: { id: resourceId } });
  //   return { ok: true };
  // }

  /**
   * Submit a quiz
   */
  // async submitQuiz(quizId: number, responses: any[]) {
  //   const quiz = await this.prisma.quiz.findUnique({
  //     where: { id: quizId },
  //     include: { questions: true },
  //   });
  //   if (!quiz) throw new NotFoundException('Quiz not found');

  //   // Validate required questions
  //   const required = quiz.questions.filter((q) => q.required);
  //   const answeredRequired = required.filter((req) =>
  //     responses.some(
  //       (r) =>
  //         r.questionId === req.id &&
  //         (r.answer !== undefined &&
  //           r.answer !== null &&
  //           (Array.isArray(r.answer)
  //             ? r.answer.length > 0
  //             : ('' + r.answer).trim().length > 0)),
  //     ),
  //   );

  //   if (answeredRequired.length < required.length) {
  //     throw new BadRequestException('Please answer all required questions');
  //   }

  //   await this.prisma.quizAttempt.create({
  //     data: {
  //       quizId,
  //       responses: JSON.stringify(responses),
  //     },
  //   });

  //   return { ok: true, message: 'Quiz submitted' };
  // }
}
