import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { CourseService } from './course.service';

@Controller('course-public')
export class CoursePublicController {
  constructor(private readonly courseService: CourseService) {}

  // List available courses for a student, with enrollment status
  @UseGuards(AuthGuard)
  @Get('courses')
  async getAvailableCourses(@Req() req: Request) {
    const user = (req as any).user;
    return this.courseService.getStudentCourses(user.sub);
  }

  // Get a specific course view for student (only unlocked lessons)
  @UseGuards(AuthGuard)
  @Get('course/:id')
  async getCourseForStudent(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.getCourseForStudent(id);
  }

  // Enrollment status for a course
  @UseGuards(AuthGuard)
  @Get('course/:id/status')
  async getEnrollmentStatus(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.courseService.getStudentEnrollmentStatus(user.sub, id);
  }

  // Enroll current student into a course (no payment for now). Fails if course is closed
  @UseGuards(AuthGuard)
  @Post('enroll')
  async enroll(@Body() body: { courseId: number }, @Req() req: Request) {
    const user = (req as any).user;
    return this.courseService.enrollStudent(user.sub, Number(body.courseId));
  }
}
