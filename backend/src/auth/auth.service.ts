import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private jwtService: JwtService,
    private UsersService: UserService,
    private configService: ConfigService,
  ) {}

  async Login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.UsersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please activate your email before logging in',
      );
    }

    const payload = {
      sub: user.id,
      id: user.id, // ✅ Add id field for controllers that use req.user.id
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refresh_token = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refresh_token },
    });

    return { access_token, refresh_token };
  }

  async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
    try {
      const decode = await this.jwtService.verifyAsync(refresh_token);
      const user = await this.prisma.user.findUnique({
        where: { id: decode.sub },
      });
      if (!user || user.refresh_token !== refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const payload = {
        sub: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const newAccessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new BadRequestException(
        'Verification link has expired. Please register again.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async sendResetCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is ${code}.`,
    });
  }

  async findUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profile: {
          select: {
            id: true,
            avatar: true,
            work: true,
            resident: true,
            education: true,
            phone: true,
            dateOfBirth: true,
            province: true,
            district: true,
            sector: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    console.log(user);

    return user;
  }
  async getTopDistricts() {
    const districts = await this.prisma.profile.groupBy({
      by: ['district'],
      _count: {
        district: true,
      },
      where: {
        district: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          district: 'desc',
        },
      },
      take: 5,
    });

    const totalProfiles = await this.prisma.profile.count({
      where: {
        district: {
          not: null,
        },
      },
    });

    return districts
      .filter((d) => d.district !== '') // Filter out empty strings if any
      .map((d) => ({
        name: d.district,
        students: d._count.district,
        percent:
          totalProfiles > 0
            ? Math.round((d._count.district / totalProfiles) * 100) + '%'
            : '0%',
      }));
  }
}
