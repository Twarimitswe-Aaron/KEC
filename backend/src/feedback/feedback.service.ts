import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {feedBackResDto} from './dto/feedBackResDto.dto'
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prismaService:PrismaService,
    private readonly configServie:ConfigService,
    private readonly jwtServie:JwtService
    
  ){}

  async create(createFeedbackDto: CreateFeedbackDto) {
    const id=Number(createFeedbackDto.posterId)
    if (!id || isNaN(id)) {
      throw new Error("Invalid posterId");
    }
  
    if (!createFeedbackDto.content?.trim()) {
      throw new Error("Content is required");
    }
    const poster = await this.prismaService.student.findUnique({
      where: { userId: id },
    });

    if (!poster) {
      throw new Error(`User with ID ${id} does not exist`);
    }

    const newFeedBack=await this.prismaService.feedback.create({
      data:{
        feedback :createFeedbackDto.content,
        studentId: poster.id,
      },
      include:{student:true}
    })
    return {message:"Feedback is posted successfull"}

  }

  async findAll() {
    const allFeedbacksRaw = await this.prismaService.feedback.findMany({
      include: {
        student: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });
    
    const allFeedbacks: feedBackResDto[] = allFeedbacksRaw.map(fb => ({
      content: fb.feedback,         // rename feedback → content
      createdAt: fb.createdAt.toISOString(),
      poster: {
        firstName: fb.student.user.firstName,
        lastName: fb.student.user.lastName,
        avatar: fb.student.user.profile?.avatar ?? '',
        email: fb.student.user.email,
      }
    }));
    
    console.log(allFeedbacks)

    return allFeedbacks;
  }

  findOne(id: number) {
    return `This action returns a #${id} feedback`;
  }

  update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
}
