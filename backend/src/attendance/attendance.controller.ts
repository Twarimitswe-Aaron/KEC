import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import * as ExcelJS from 'exceljs';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('session')
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Request() req,
    @Body() body: { courseId: number; title?: string },
  ) {
    return this.attendanceService.createSession(
      body.courseId,
      req.user.id,
      body.title,
    );
  }

  @Post('mark/:sessionId')
  @Roles('student', 'admin', 'teacher')
  @HttpCode(HttpStatus.OK)
  async markAttendance(
    @Request() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.markAttendance(sessionId, req.user.id);
  }

  @Get('session/:sessionId')
  @Roles('admin', 'teacher')
  async getSessionRecords(
    @Request() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.getSessionRecords(sessionId, req.user.id);
  }

  @Get('course/:courseId/active')
  async getActiveSessions(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.attendanceService.getActiveSessions(courseId);
  }

  @Get('course/:courseId/all')
  @Roles('admin', 'teacher')
  async getCourseSessions(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.attendanceService.getCourseSessions(courseId);
  }

  @Patch('session/:sessionId/close')
  @Roles('admin', 'teacher')
  async closeSession(
    @Request() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.closeSession(sessionId, req.user.id);
  }

  @Get('export/:sessionId')
  @Roles('admin', 'teacher')
  async exportToExcel(
    @Request() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    const data = await this.attendanceService.getSessionRecords(
      sessionId,
      req.user.id,
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value =
      `Attendance Report - ${data.session.courseTitle}`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add session info
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value =
      `Session: ${data.session.title} | Date: ${new Date(data.session.createdAt).toLocaleString()}`;
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Add summary
    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value =
      `Total: ${data.summary.totalStudents} | Present: ${data.summary.present} | Absent: ${data.summary.absent}`;
    worksheet.getCell('A3').font = { bold: true, size: 11 };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow([
      'Student ID',
      'Student Name',
      'Email',
      'Status',
      'Time Marked',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Add data
    data.attendanceList.forEach((record) => {
      worksheet.addRow([
        record.studentId,
        record.studentName,
        record.email,
        record.present ? 'Present' : 'Absent',
        record.markedAt ? new Date(record.markedAt).toLocaleString() : 'N/A',
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (!column || !column.eachCell) return; // Skip undefined columns or columns without eachCell
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new StreamableFile(new Uint8Array(buffer), {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="attendance-${sessionId}-${Date.now()}.xlsx"`,
    });
  }
}
