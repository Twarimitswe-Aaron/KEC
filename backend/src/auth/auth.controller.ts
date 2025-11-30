import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  HttpCode,
  UseGuards,
  Request,
  Put,
  Req,
  NotFoundException,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { ForgotPass } from './dto/forgotPass.dto';
import { VerifyToken } from './dto/verifyToken';
import { ResetPassword } from './dto/resetPassword.dto';
import { ResetKnownPassDto } from './dto/resetKnownPass.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.Login(
      signInDto.email,
      signInDto.password,
    );
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: signInDto.email },
      });
      if (!user) {
        throw new BadRequestException('Login failed');
      }

      res.cookie('jwt_access', access_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite:
          this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
        path: '/',
      });

      res.cookie('jwt_refresh', refresh_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite:
          this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
        path: '/',
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      throw new BadRequestException('Login failed');
    }
  }

  @Get('me')
  async me(@Request() req: ExpressRequest) {
    try {
      const token = req.cookies['jwt_access'];
      if (!token) {
        console.error('Auth Error: No access token provided');
        throw new BadRequestException('No access token provided');
      }

      let decoded;
      try {
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
      } catch (jwtError) {
        console.error('JWT Verification Error:', jwtError.message);
        if (jwtError.name === 'TokenExpiredError') {
          throw new BadRequestException('Token has expired');
        } else if (jwtError.name === 'JsonWebTokenError') {
          throw new BadRequestException('Invalid token signature');
        }
        throw new BadRequestException('Token verification failed');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { profile: true },
      });

      if (!user) {
        console.error(`Auth Error: User not found for ID: ${decoded.sub}`);
        throw new BadRequestException('User not found');
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
          ? {
              avatar: user.profile.avatar,
              work: user.profile.work,
              education: user.profile.education,
              phone: user.profile.phone,
              province: user.profile.province,
              district: user.profile.district,
              sector: user.profile.sector,
              dateOfBirth: user.profile.dateOfBirth,
              updatedAt: user.profile.updatedAt,
            }
          : null,
      };
    } catch (error) {
      // Re-throw if it's already a BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log unexpected errors
      console.error('Unexpected Auth Error:', error);
      throw new BadRequestException('Authentication failed');
    }
  }

  @UseGuards(AuthGuard)
  @Get('Dashboard')
  getDashboard(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Put('update-profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async updateProfile(
    @Req() req,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body?: UpdateUserDto,
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new BadRequestException('User not found');
    }

    let parsedProfile: any = {};
    if (body?.profile) {
      try {
        parsedProfile =
          typeof body.profile === 'string'
            ? JSON.parse(body.profile)
            : body.profile;
      } catch (err) {
        throw new BadRequestException('Invalid profile JSON format');
      }
    }

    const avatarUrl = avatar
      ? `${this.configService.get('BACKEND_URL')}/uploads/avatars/${avatar.filename}`
      : undefined;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { email },
        data: {
          firstName: body?.firstName ?? undefined,
          lastName: body?.lastName ?? undefined,
          profile: {
            upsert: {
              create: {
                work: parsedProfile?.work ?? undefined,
                education: parsedProfile?.education ?? undefined,
                phone: parsedProfile?.phone ?? undefined,
                province: parsedProfile?.province ?? undefined,
                district: parsedProfile?.district ?? undefined,
                sector: parsedProfile?.sector ?? undefined,
                dateOfBirth: parsedProfile?.dateOfBirth
                  ? new Date(parsedProfile.dateOfBirth)
                  : undefined,
                avatar: avatarUrl ?? undefined,
              },
              update: {
                work: parsedProfile?.work ?? undefined,
                education: parsedProfile?.education ?? undefined,
                phone: parsedProfile?.phone ?? undefined,
                province: parsedProfile?.province ?? undefined,
                district: parsedProfile?.district ?? undefined,
                sector: parsedProfile?.sector ?? undefined,
                dateOfBirth: parsedProfile?.dateOfBirth
                  ? new Date(parsedProfile.dateOfBirth)
                  : undefined,
                avatar: avatarUrl ?? undefined,
              },
            },
          },
        },
        include: { profile: true },
      });

      console.log('Profile updated:', updatedUser);
      return { message: 'Profile updated successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Profile not found for the given user');
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile/:id')
  async getUser(@Param('id') id: string) {
    const userId = Number(id);
    if (isNaN(userId)) throw new NotFoundException('Invalid user ID');

    return this.authService.findUserProfile(userId);
  }

  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Request() req: ExpressRequest,
  ) {
    const refresh_token = req.cookies['jwt_refresh'];
    if (!refresh_token) {
      throw new BadRequestException('No refresh token provided');
    }

    const { access_token } = await this.authService.refreshToken(refresh_token);
    res.cookie('jwt_access', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new BadRequestException('Invalid verification link');
    }
    try {
      await this.authService.verifyEmail(token);
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/dashboard`,
      );
    } catch (error) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/verification-failed`,
      );
    }
  }

  @Post('requestCode')
  async forgotPassword(@Body() forgotDto: ForgotPass) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotDto.email },
    });

    if (!user) {
      throw new BadRequestException('No user with this email, Please sign up');
    }
    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Please go to your email to verify your account',
      );
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.resetToken.create({
      data: {
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await this.authService.sendResetCode(user.email, code);
    return {
      message: `Reset code sent to ${user.email}. It is valid for 10 minutes.`,
    };
  }

  @Post('verifyResetCode')
  async verifyResetCode(@Body() verifyDto: VerifyToken) {
    const record = await this.prisma.resetToken.findFirst({
      where: { email: verifyDto.email, code: verifyDto.code },
    });

    if (!record) {
      throw new BadRequestException('Invalid reset code');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Reset code has expired. Please request a new one.',
      );
    }
    const email = verifyDto.email;

    return { email };
  }

  @Post('resetPassword')
  async resetPassword(@Body() resetDto: ResetPassword) {
    if (resetDto.password !== resetDto.confirmPassword) {
      throw new BadRequestException('Passwords does not match');
    }

    const record = await this.prisma.resetToken.findFirst({
      where: { email: resetDto.email },
      orderBy: { expiresAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid request');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.',
      );
    }
    const hashedPassword = await this.authService.hashPassword(
      resetDto.password,
    );
    await this.prisma.user.update({
      where: { email: resetDto.email },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successful' };
  }

  @Post('resetKnownPassword')
  async resetKnownPass(@Body() resetKnowPassDto: ResetKnownPassDto) {
    const record = await this.prisma.user.findUnique({
      where: { email: resetKnowPassDto.email },
    });
    if (!record) {
      throw new BadRequestException('Invalid Credentials');
    }
    const hashedPassword = await this.authService.hashPassword(
      resetKnowPassDto.password,
    );
    await this.prisma.user.update({
      where: { email: resetKnowPassDto.email },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfull' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt_access', { path: '/' });
    res.clearCookie('jwt_refresh', { path: '/' });

    return { message: 'Logged out successfully' };
  }
  @Get('top-locations')
  async getTopLocations() {
    return this.authService.getTopDistricts();
  }
}
