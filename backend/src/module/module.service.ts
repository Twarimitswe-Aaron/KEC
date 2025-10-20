import * as path from 'path'
import * as fs from 'fs'
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient, ResourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';

interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: string | null;
  required: boolean;
  orderIndex: number;
  order: number;
  points: number;
}

interface QuizAttempt {
  id: number;
  submittedAt: Date;
  responses: string;
  score: number;
  totalPoints: number;
  detailedResults: string | null;
}

interface Quiz {
  id: number;
  name: string;
  description: string | null;
  settings: string | null;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
}

interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  size: string | null;
  duration: string | null;
  url: string | null;
  uploadedAt: Date | null;
  form?: {
    id: number;
    title: string;
    description: string | null;
    quizzes?: Quiz[];
  };
}

interface LessonWithResources extends Prisma.LessonGetPayload<{
  include: {
    resources: {
      include: {
        form: {
          include: {
            quizzes: {
              include: {
                questions: true;
                attempts: true;
              };
            };
          };
        };
      };
    };
  };
}> {}
import { CreateVideoDto } from './dto/create-video.dto';

type ResourceWithForm = Prisma.ResourceGetPayload<{
  include: {
    form: {
      include: {
        questions: true;
        quizzes: {
          include: {
            questions: true;
            attempts: true;
          };
        };
      };
    };
  };
}>;

interface ResourceWithFormAndQuizzes extends ResourceWithForm {
  form: ({
    questions: Array<{
      id: number;
      formId: number;
      questionText: string;
      type: string;
      required: boolean;
    }>;
    quizzes: Array<{
      id: number;
      name: string;
      description: string | null;
      settings: string | null;
      formId: number | null;
      questions: Array<{
        id: number;
        quizId: number;
        type: string;
        question: string;
        options: string | null;
        correctAnswer: number | null;
        correctAnswers: string | null;
        required: boolean;
        orderIndex: number;
        order: number;
        points: number;
      }>;
      attempts: Array<{
        id: number;
        quizId: number;
        submittedAt: Date;
        responses: string;
        score: number;
        totalPoints: number;
        detailedResults: string | null;
      }>;
    }>;
  } & ResourceWithForm['form']) | null;
}

interface FormWithQuizzes {
  id: number;
  title: string;
  description: string | null;
  resourceId: number;
  quizzes: Array<{
    id: number;
    name: string;
    description: string | null;
    settings: string | null;
    formId: number | null;
    questions: Array<{
      id: number;
      quizId: number;
      type: string;
      question: string;
      options: string | null;
      correctAnswer: number | null;
      correctAnswers: string | null;
      required: boolean;
      orderIndex: number;
      order: number;
      points: number;
    }>;
    attempts: Array<{
      id: number;
      quizId: number;
      submittedAt: Date;
      responses: string;
      score: number;
      totalPoints: number;
      detailedResults: string | null;
    }>;
  }>;
}
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AddResourceDto } from './dto/add-resource.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async getLessonsByCourse(courseId: number) {
    // Define the type for the lesson with its relations
    type LessonWithResources = Prisma.LessonGetPayload<{
      include: {
        resources: {
          include: {
            form: {
              include: {
                quizzes: {
                  include: {
                    questions: true;
                    attempts: true;
                  };
                };
              };
            };
          };
        };
      };
    }>;

    try {
      const lessons = await this.prisma.lesson.findMany({
        where: { courseId },
        include: {
          resources: {
            include: {
              form: {
                include: {
                  quizzes: {
                    include: {
                      questions: true,
                      attempts: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { id: 'asc' },
      }) as unknown as LessonWithResources[];

      return lessons.map(lesson => {
        const resources = lesson.resources?.map(resource => {
          const quiz = resource.form?.quizzes?.[0];
          const resourceData = {
            id: resource.id,
            url: resource.url || null,
            title: resource.name || 'Untitled Resource',
            type: resource.type,
            size: resource.size || null,
            duration: resource.duration || null,
            uploadedAt: resource.uploadedAt?.toISOString() || null,
          };

          if (quiz) {
            return {
              ...resourceData,
              quiz: {
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                questions: quiz.questions?.map(q => ({
                  id: q.id,
                  type: q.type,
                  question: q.question,
                  options: q.options ? JSON.parse(q.options) : null,
                  required: q.required,
                })) || [],
                attempts: quiz.attempts || []
              }
            };
          }
          return resourceData;
        }) || [];

        return {
          id: lesson.id,
          title: lesson.title,
          content: lesson.description,
          description: lesson.description,
          courseId: lesson.courseId,
          isUnlocked: lesson.isUnlocked,
          order: lesson.id,
          resources
        };
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new Error('Failed to fetch lessons');
    }
  }

  async getLessonById(id: number) {
    type LessonWithResources = Prisma.LessonGetPayload<{
      include: {
        resources: {
          include: {
            form: {
              include: {
                questions: true;
                quizzes: {
                  include: {
                    questions: true;
                    attempts: true;
                  };
                };
              };
            };
          };
        };
      };
    }>;

    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id },
        include: {
          resources: {
            include: {
              form: {
                include: {
                  questions: true,
                  quizzes: {
                    include: {
                      questions: true,
                      attempts: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      // Type assertion since we've already included all necessary relations
      const typedLesson = lesson as unknown as LessonWithResources;

      return {
        id: typedLesson.id,
        title: typedLesson.title,
        content: typedLesson.description,
        description: typedLesson.description,
        courseId: typedLesson.courseId,
        isUnlocked: typedLesson.isUnlocked,
        order: typedLesson.id,
        resources: typedLesson.resources.map(resource => {
          const quiz = resource.form?.quizzes?.[0];
          const resourceData = {
            id: resource.id,
            url: resource.url || null,
            title: resource.name || 'Untitled Resource',
            type: resource.type,
            size: resource.size || null,
            duration: resource.duration || null,
            uploadedAt: resource.uploadedAt?.toISOString() || null,
          };

          if (quiz) {
            return {
              ...resourceData,
              quiz: {
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                questions: quiz.questions?.map(q => ({
                  id: q.id,
                  type: q.type,
                  question: q.question,
                  options: q.options ? JSON.parse(q.options) : null,
                  required: q.required,
                })) || [],
                attempts: quiz.attempts || []
              }
            };
          }
          return resourceData;
        }),
      };
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw new Error('Failed to fetch lesson');
    }
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
      include: { 
        form: {
          include: {
            quizzes: {
              include: {
                questions: true,
                attempts: true
              }
            }
          }
        } 
      }
    });

    // Type assertion to handle the form with quizzes
    const typedResources = resources as unknown as Array<{
      form: FormWithQuizzes | null;
    }>;

    for (const resource of typedResources) {
      if (resource.form?.quizzes?.length) {
        for (const quiz of resource.form.quizzes) {
          // Delete quiz attempts first
          if (quiz.attempts?.length) {
            await this.prisma.quizAttempt.deleteMany({
              where: { quizId: quiz.id }
            });
          }
          
          // Delete quiz questions
          if (quiz.questions?.length) {
            await this.prisma.quizQuestion.deleteMany({
              where: { quizId: quiz.id }
            });
          }
          
          // Delete the quiz
          await this.prisma.quiz.delete({
            where: { id: quiz.id }
          });
        }
        
        // Delete the form
        await this.prisma.form.delete({
          where: { id: resource.form.id }
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

  let fileUrl: string | null = null;
  let fileSize: string | null = null;

 
  if (dto.file && ['pdf', 'word'].includes(dto.type)) {
  
    const { filename, size } = dto.file;
    fileUrl = `/uploads/${dto.type}/${filename}`;
    fileSize = `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

 
  if (dto.type === 'quiz' && dto.file) {
    throw new BadRequestException('Quiz must not contain a file');
  }


  await this.prisma.resource.create({
    data: {
      lessonId,
      name: dto.title,
      type: dto.type,
      url: fileUrl,
      size: fileSize,
    },
  });

  return { message: 'Resource added successfully' };
}



  async deleteResource(lessonId: number, resourceId: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: { 
        form: {
          include: {
            quizzes: true
          }
        }
      }
    });
    
    if (!resource) throw new NotFoundException('Resource not found');

    if (resource.lessonId !== lessonId) {
      throw new BadRequestException('Resource does not belong to this lesson');
    }

    // If it's a quiz resource, delete the form and its related quizzes
    if (resource.form) {
      await this.prisma.form.delete({
        where: { id: resource.form.id },
        include: { quizzes: true }
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
            form: {
              include: {
                quizzes: {
                  include: {
                    questions: true,
                  },
                },
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
      if (resource.type === 'quiz' && resource.form?.quizzes && resource.form.quizzes.length > 0) {
        const quizToDuplicate = resource.form.quizzes[0];
        const duplicatedQuiz = await this.prisma.quiz.create({
          data: {
            name: quizToDuplicate.name,
            description: quizToDuplicate.description,
            formId: resource.form.id,
            questions: {
              create: quizToDuplicate.questions.map(question => ({
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
            url: resource.url,
            size: resource.size,
            uploadedAt: new Date(),
            form: {
              connect: { id: duplicatedQuiz.id },
            },
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
        duration: dto.duration || '--',
        uploadedAt: new Date(),
      },
    });

    return {message: "Video resource added successfully",};
  }

async addQuizResource(lessonId: number, dto: CreateQuizDto) {
 
  const lesson = await this.prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new NotFoundException('Lesson not found');
  }


  let resource = await this.prisma.resource.findFirst({
    where: {
      lessonId,
      name: dto.name,
      type: 'quiz',
    },
    include: { form: { include: { quizzes: true } } },
  });

  if (!resource) {

    resource = await this.prisma.resource.create({
      data: {
        name: dto.name,
        type: 'quiz',
        lessonId,
      },
      include: { form: { include: { quizzes: true } } },
    });
  }

 
  let form = resource.form;
  if (!form) {
    form = await this.prisma.form.create({
      data: {
        resourceId: resource.id,
        quizzes: {
          create: {
            name: dto.name,
            description: dto.description || '',
          },
        },
      },
      include: { quizzes: true },
    });
  } else {
  
    await this.prisma.quiz.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        formId: form.id,
      },
    });
  }

  return {
    message: 'Quiz added successfully'

  };
}





async submitQuiz(quizId: number, responses: Array<{ questionId: number; answer: any }>): Promise<{ message: string; success: boolean }> {
    // First, verify all required questions are answered
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if all required questions are answered
    const requiredQuestions = quiz.questions.filter(q => q.required);
    const answeredQuestionIds = new Set(responses.map(r => r.questionId));
    const missingRequired = requiredQuestions.some(q => !answeredQuestionIds.has(q.id));

    if (missingRequired) {
      throw new BadRequestException('Please answer all required questions');
    }

    await this.prisma.quizAttempt.create({
      data: {
        quizId,
        responses: JSON.stringify(responses),
        submittedAt: new Date(),
        score: 0, // You might want to calculate this based on correct answers
        totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
      },
    });

    return { 
      message: 'Quiz submitted successfully',
      success: true,
    };
  }
}