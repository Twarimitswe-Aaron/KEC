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

  async getCourseById(id: string) {

    const course = await this.prisma.course.findUnique({
      where: { id: Number(id) },
      include: { lesson:{include:{resources:true}},uploader:{
        include:{profile:true}
      } },
    });

    if (!course) {
      return { message: 'Course not found' };
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: '0',
      open: course.open,
      isConfirmed: course.isConfirmed,
      lesson: course.lesson,
      uploader: {
        id: course.uploaderId,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || '',
      },
    };
  }

  async findAllUnconfirmed() {
    const getAllUploaded = await this.prisma.course.findMany({
      where:{isConfirmed:false},
      include:{uploader:{include:{profile:true}}}
    });
    
    return getAllUploaded.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: "0", 
      open: course.open,
    
      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || "",
      }
    }));
  }

  async confirmCourse(confirmCourseDto: ConfirmCourseDto) {
    const { id } = confirmCourseDto;
    const course = await this.prisma.course.update({
      where:{id},
      data:{isConfirmed:true}
    });
    return {message:"Course confirmed successfully"}
  }
  async deleteCourse(confirmCourseDto: ConfirmCourseDto) {
    const { id } = confirmCourseDto;
    const course = await this.prisma.course.delete({
      where:{id}
    });
    return {message:"Course confirmed successfully"}
  }


  async findAllUploaded() {
    const getAllUploaded = await this.prisma.course.findMany({
      where:{isConfirmed:true},
      include:{uploader:{include:{profile:true}}}
    });
    
    return getAllUploaded.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.coursePrice,
      image_url: course.image_url,
      no_lessons: "0", 
      open: course.open,
      uploader: {
        id: course.uploader?.id,
        name: `${course.uploader?.firstName} ${course.uploader?.lastName}`,
        email: course.uploader?.email,
        avatar_url: course.uploader?.profile?.avatar || "",
      }
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
