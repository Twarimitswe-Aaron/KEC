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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { ForgotPass } from './dto/forgotPass.dto';
import { VerifyToken } from './dto/verifyToken';
import { ResetPassword } from './dto/resetPassword.dto';
import { ResetKnownPassDto } from './dto/resetKnownPass.dto';

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
        sameSite: 'strict',
        path: '/',
      });

      res.cookie('jwt_refresh', refresh_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
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
        throw new BadRequestException('No access token provided');
      }
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      return user;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  @UseGuards(AuthGuard)
  @Get('Dashboard')
  getDashboard(@Request() req) {
    return req.user;
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
      sameSite: 'strict',
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

  @Post("resetKnownPassword")
  async resetKnownPass(@Body() resetKnowPassDto:ResetKnownPassDto){
  const record=await this.prisma.user.findUnique({
    where:{email:resetKnowPassDto.email}
  })
  if(!record){
    throw new BadRequestException("Invalid Credentials");
  }
  const hashedPassword = await this.authService.hashPassword(
    resetKnowPassDto.password,
  );
  await this.prisma.user.update({
    where:{email:resetKnowPassDto.email},
    data:{password:hashedPassword}
  })

  return {message:"Password reset successfull"}

  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt_access', { path: '/' });
    res.clearCookie('jwt_refresh', { path: '/' });

    return { message: 'Logged out successfully' };
  }
}
