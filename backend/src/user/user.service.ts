import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    await this.prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, role },
    });
    return { message: "User created successfully" };
  }

  async findAll(): Promise<Array<{ id: number; name: string; email: string; role: string; avatar: string }>> {
    const users=await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,

        profile: {
          select: {
            avatar: true,
          },
        },
      },
    });

    console.log(users)
    return users.map((u) => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
        email: u.email,
        role: u.role,
        avatar: u.profile?.avatar || '/images/default-avatar.png',
      }));
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}