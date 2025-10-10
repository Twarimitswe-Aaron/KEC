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

    await this.prisma.user.create({
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
      include: {
        profile: true,
      },
    });
    return { message: 'User created successfully' };
  }

  async findAll(): Promise<
    Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      avatar: string;
    }>
  > {
    const users = await this.prisma.user.findMany({
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
   
    const backgroundColor = Math.floor(Math.random() * 16777215).toString(16); // Random hex color

   
    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
      email: u.email,
      role: u.role,
      avatar: u.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName.charAt(0))}&background=${backgroundColor}&color=fff&size=64&font-size=0.5&length=2&rounded=false&bold=true`,
    }));
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
