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
    const { firstName, lastName, email, password, confirmPassword } = dto;

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      if(password !== confirmPassword){
        throw new BadRequestException("Password doesn't match")
      }
    
      


      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          if (
            existingUser.tokenExpiresAt &&
            existingUser.tokenExpiresAt > new Date()
          ) {
            throw new BadRequestException(
              'A verification email has already been sent. Please check your email to activate your account.',
            );
          } else {
            throw new BadRequestException(
              'Your previous verification link expired. Please register again.',
            );
          }
        } else {
          throw new BadRequestException(
            'Account already exists. Please log in.',
          );
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

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

      return {
        status: 'success',
        message:
          `Registration successful! Please check ${email} to verify your account.`,
        student: {
          id: student.id,
          email: student.user.email,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
        },
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists.');
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'Something went wrong. Please try again.',
      );
    }
  }

  async sendVerificationEmail(email: string, token: string) {
   
    const backendUrl = this.configService.get('BACKEND_URL');
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
      from: `"No Reply" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Activate your account',
      html: `
        <h1>Account Activation</h1>
        <p>Thank you for registering. Please click the link below to activate your email:</p>
        <a href="${verificationLink}">Activate your account</a>
      `,
    });
  }
}
