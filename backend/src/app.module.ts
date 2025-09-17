import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { StudentModule } from './student/student.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup/cleanup.service';
import { UserModule } from './user/user.module';
import { CsrfController } from './csrf/csrf.controller';
import { CsrfModule } from './csrf/csrf.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    StudentModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    CsrfModule,
    DashboardModule,
    PaymentModule,
    UserManagementModule,
  ],
  controllers: [AppController, CsrfController],
  providers: [AppService, PrismaService, CleanupService],
})
export class AppModule {}
