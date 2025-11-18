import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseAnalyticsController } from './course.analytics.controller';
import { CoursePublicController } from './course.public.controller';

@Module({
  controllers: [CourseController, CourseAnalyticsController, CoursePublicController],
  providers: [CourseService],
})
export class CourseModule {}
