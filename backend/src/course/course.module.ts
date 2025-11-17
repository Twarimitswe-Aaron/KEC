import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseAnalyticsController } from './course.analytics.controller';

@Module({
  controllers: [CourseController, CourseAnalyticsController],
  providers: [CourseService],
})
export class CourseModule {}
