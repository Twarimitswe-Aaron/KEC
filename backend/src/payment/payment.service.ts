import { Injectable, NotFoundException } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MomoService } from './momo.service';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly momoService: MomoService,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto, userId: number) {
    try {
      // Initiate payment with MTN MoMo
      const momoResponse = await this.momoService.requestToPay(
        dto.phoneNumber,
        dto.amount.toString(),
        `COURSE-${dto.courseId}-USER-${userId}`,
      );

      // Create payment record in database
      const payment = await this.prisma.payment.create({
        data: {
          referenceId: momoResponse.referenceId,
          courseId: dto.courseId,
          userId: userId,
          phoneNumber: dto.phoneNumber,
          amount: dto.amount,
          status: PaymentStatus.PENDING,
          location: `${dto.location.sector}, ${dto.location.district}`,
          province: dto.location.province,
          city: dto.location.district,
        },
      });

      // Also update/create user profile location
      await this.prisma.profile.upsert({
        where: { userId: userId },
        update: {
          province: dto.location.province,
          district: dto.location.district,
          sector: dto.location.sector,
        },
        create: {
          userId: userId,
          province: dto.location.province,
          district: dto.location.district,
          sector: dto.location.sector,
        },
      });

      return {
        referenceId: payment.referenceId,
        message:
          'Payment initiated successfully. Please complete on your phone.',
      };
    } catch (error) {
      console.error('❌ [Payment] Error initiating payment:', error);
      throw new Error('Failed to initiate payment: ' + error.message);
    }
  }

  async checkPaymentStatus(referenceId: string) {
    try {
      // Get payment from database
      const payment = await this.prisma.payment.findUnique({
        where: { referenceId },
        include: {
          user: true,
          course: true,
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // If payment is already successful or failed, return cached status
      if (
        payment.status === PaymentStatus.SUCCESSFUL ||
        payment.status === PaymentStatus.FAILED
      ) {
        return { payment };
      }

      // Check status with MTN MoMo
      const momoStatus = await this.momoService.checkPayment(referenceId);

      console.log(' [Payment] MoMo status response:', momoStatus);

      // Update payment status based on MoMo response
      let newStatus: PaymentStatus = payment.status as PaymentStatus;
      if (momoStatus.status === 'SUCCESSFUL') {
        newStatus = PaymentStatus.SUCCESSFUL;
        // Create enrollment when payment is successful
        await this.createEnrollmentAfterPayment(
          payment.userId,
          payment.courseId,
        );
      } else if (momoStatus.status === 'FAILED') {
        newStatus = PaymentStatus.FAILED;
      }

      // Update payment record
      const updatedPayment = await this.prisma.payment.update({
        where: { referenceId },
        data: { status: newStatus },
        include: {
          user: true,
          course: true,
        },
      });

      return {
        payment: updatedPayment,
        momoStatus,
      };
    } catch (error) {
      console.error(' [Payment] Error checking payment status:', error);
      throw error;
    }
  }

  async createEnrollmentAfterPayment(userId: number, courseId: number) {
    try {
      // Check if enrollment already exists
      const existingEnrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
        },
      });

      if (existingEnrollment) {
        console.log('ℹ [Payment] Enrollment already exists');
        return existingEnrollment;
      }

      // Get the successful payment for this user and course
      const payment = await this.prisma.payment.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
          status: PaymentStatus.SUCCESSFUL,
        },
        orderBy: {
          completedAt: 'desc', // Get the most recent successful payment
        },
      });

      // Create enrollment
      const enrollment = await this.prisma.enrollment.create({
        data: {
          userId: userId,
          courseId: courseId,
          paymentId: payment?.id, // Link to the payment if found
        },
      });

      console.log('✅ [Payment] Created enrollment:', enrollment.id);
      return enrollment;
    } catch (error) {
      console.error('❌ [Payment] Error creating enrollment:', error);
      throw error;
    }
  }

  async getUserPayments(userId: number) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image_url: true,
          },
        },
      },
      orderBy: {
        initiatedAt: 'desc',
      },
    });
  }

  async checkCourseAccess(courseId: number, userId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        courseId,
        userId,
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    return { canAccess: !!payment };
  }

  async handleWebhook(body: any) {
    console.log('🔔 [Payment] Webhook received:', body);
    // MTN MoMo webhook handler
    // This would be called by MTN when payment status changes
    // Update payment status based on webhook data
    try {
      const referenceId = body.referenceId || body.transactionId;
      if (referenceId) {
        await this.checkPaymentStatus(referenceId);
      }
      return { message: 'Webhook processed' };
    } catch (error) {
      console.error('❌ [Payment] Webhook error:', error);
      return { message: 'Webhook processing failed' };
    }
  }
}
