import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CourseService } from './course.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('courses')
export class CourseAnalyticsController {
  constructor(private readonly courseService: CourseService) {}

  @Get(':id/analytics')
  async getCourseAnalytics(@Param('id') id: string) {
    const courseId = Number(id);
    return this.courseService.getCourseAnalytics(courseId);
  }
}
