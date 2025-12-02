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
import { AnnouncementModule } from './announcement/announcement.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CsrfExceptionFilter } from './filters/csrf-exception.filter';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { FeedbackModule } from './feedback/feedback.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './module/module.module';
import { QuizModule } from './quiz/quiz.module';
import { ChatModule } from './chat/chat.module';
import { CertificateModule } from './certificate/certificate.module';
import { RatingModule } from './rating/rating.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkshopModule } from './workshop/workshop.module';

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
    AnnouncementModule,
    FeedbackModule,
    CourseModule,
    ModuleModule,
    QuizModule,
    ChatModule,
    CertificateModule,
    RatingModule,
    ServiceRequestModule,
    AnalyticsModule,
    WorkshopModule,
  ],
  controllers: [AppController, CsrfController],
  providers: [
    AppService,
    PrismaService,
    CleanupService,
    {
      provide: APP_FILTER,
      useClass: CsrfExceptionFilter,
    },
  ],
})
export class AppModule {}
