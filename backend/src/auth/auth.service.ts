import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private jwtService: JwtService,
    private UsersService: UserService,
  ) {}

  async Login(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.UsersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const correctPassword = await bcrypt.compare(pass, user.password);
     if( !user.isEmailVerified){
        throw new UnauthorizedException('Please activate your email before logging in');
     }
    if (!correctPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const access_token = await this.jwtService.signAsync(
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
        email: user.email,
        role: user.role,
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
}
