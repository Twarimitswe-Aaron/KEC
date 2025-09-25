import { Injectable } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
 async create(createAnnouncementDto: CreateAnnouncementDto) {

    const { body } = createAnnouncementDto;
   


    const id=Number(body.posterId)
    if (!id || isNaN(id)) {
      throw new Error("Invalid posterId");
    }
  
    if (!body.content?.trim()) {
      throw new Error("Content is required");
    }
    const poster = await this.prismaService.user.findUnique({
      where: { id: id },
    });
    
    if (!poster) {
      throw new Error(`User with ID ${id} does not exist`);
    }
    
  

    const newAnnouncement = await this.prismaService.announcement.create({
      data: {
        content: body.content,
        posterId: id, // safer than connect
      },
      include: { poster: true },
    });
    
    return {message:"Announcement is posted successully"};
  }

  async findAll() {
    const allAnnouncements = await this.prismaService.announcement.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  
    return allAnnouncements;
  }
  
  

  findOne(id: number) {
    return `This action returns a #${id} announcement`;
  }

  update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    return `This action updates a #${id} announcement`;
  }

  remove(id: number) {
    return `This action removes a #${id} announcement`;
  }
}
