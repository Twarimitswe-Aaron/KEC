import { Body, Controller, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  async createStudent(@Body() dto:CreateStudentDto) {
    return this.studentService.createStudent(dto)

  }
}
