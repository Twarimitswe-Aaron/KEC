import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmCourseDto } from './dto/confirm-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCourseDto: CreateCourseDto) {
    const { id, image_url, title, description, price, uploader } =
      createCourseDto;
    const uploaderObj =
      typeof uploader === 'string' ? JSON.parse(uploader) : uploader;

    const newCourse = await this.prisma.course.create({
      data: {
        uploaderId: uploaderObj.id,
        title,
        image_url,
        description,
        coursePrice: price,
        no_lesson: 0,
      },
    });
  }

 async getCourseById(id: number) {


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

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.coursePrice,
    image_url: course.image_url,
    no_lessons: course.lesson?.length || 0,
    open: course.open,
    isConfirmed: course.isConfirmed,
    maximum: course.maximum,
    createdAt: formatDate(course.createdAt),
    updatedAt: formatDate(course.updatedAt),

    lesson: course.lesson.map((l) => ({
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


  async findAllUnconfirmed() {
    const getAllUploaded = await this.prisma.course.findMany({
      where: { isConfirmed: false },
      include: { uploader: { include: { profile: true } } },
    });

    return getAllUploaded.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: '0',
      open: course.open,

      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    }));
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
    return { message: 'Course confirmed successfully' };
  }

  async findAllUploaded() {
    const getAllUploaded = await this.prisma.course.findMany({
      where: { isConfirmed: true },
      include: { uploader: { include: { profile: true } } },
    });

    return getAllUploaded.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: '0',
      open: course.open,
      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    }));
  }

  async updateCourse(updateCourseDto: UpdateCourseDto) {
    const { title, description, price, image_url, maximum, open } =
      updateCourseDto;
    await this.prisma.course.update({
      where: { id: Number(updateCourseDto.id) },
      data: {
        title,
        description,
        coursePrice: price,
        image_url,
        maximum: Number(maximum),
        open: Boolean(open),
      },
    });
    return { message: 'Course updated successfully' };
  }

}
