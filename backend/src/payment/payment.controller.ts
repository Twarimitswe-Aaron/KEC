import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(AuthGuard)
  async initiatePayment(
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @Req() req: any,
  ) {
    // 🔍 DEBUG: Log the entire req.user to see what's in the JWT
    console.log('🔍 [Payment] req.user:', JSON.stringify(req.user, null, 2));
    const userId = req.user.id;
    console.log('🔍 [Payment] Extracted userId:', userId);
    return this.paymentService.initiatePayment(initiatePaymentDto, userId);
  }

  @Get('status/:referenceId')
  @UseGuards(AuthGuard)
  async checkPaymentStatus(@Param('referenceId') referenceId: string) {
    return this.paymentService.checkPaymentStatus(referenceId);
  }

  @Get('my-payments')
  @UseGuards(AuthGuard)
  async getUserPayments(@Req() req: any) {
    const userId = req.user.id;
    return this.paymentService.getUserPayments(userId);
  }

  @Get('course/:courseId/access')
  @UseGuards(AuthGuard)
  async checkCourseAccess(
    @Param('courseId') courseId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.paymentService.checkCourseAccess(+courseId, userId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // MTN MoMo webhook callback
    return this.paymentService.handleWebhook(body);
  }
}
