import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { CreateStudentDto } from './dto/create-student.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly configService: ConfigService,
  ) {}
  async createStudent(dto: CreateStudentDto) {
    const { firstName, lastName, email, password } = dto;
    try {
      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          if (
            existingUser.tokenExpiresAt &&
            existingUser.tokenExpiresAt > new Date()
          ) {
            throw new BadRequestException(
              'A verification email has already been sent. Please check your email to activate your account',
            );
          }
        } else {
          throw new BadRequestException(
            'Account already exists. Please log in.',
          );
        }
      }

      const student = await this.prisma.student.create({
        data: {
          user: {
            create: {
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role: Role.student,
              verificationToken,
              tokenExpiresAt,
            },
          },
        },
        include: { user: true },
      });

      await this.sendVerificationEmail(email, verificationToken);
      return { message: 'Please check your email to verify your account.' };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const backendUrl = this.configService.get('BACKEND_URL');
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationLink = `${backendUrl}/auth/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: `"No Reply" <${this.configService.get('SMTP_USER')}> `,
      to: email,
      subject: 'Activate your account',
      html: `
            <h1>Account Activation</h1>
            <p>Thank you for registering. Please click the link below to activate your email:</p>
            <a href="${verificationLink}">Activate your account</a>`,
    });
  }
}
