import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus, AttendanceSource } from '../../entities/attendance-event.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async createAttendance(
    @Body()
    body: {
      employeeId: string;
      siteId: string;
      date: string;
      status: AttendanceStatus;
      source: AttendanceSource;
      sourceFileId?: string;
      createdBy?: string;
      hours?: number;
    },
  ) {
    return await this.attendanceService.createOrUpdateAttendance(
      body.employeeId,
      body.siteId,
      new Date(body.date),
      body.status,
      body.source,
      body.sourceFileId,
      body.createdBy,
      body.hours,
    );
  }

  @Get('employee/:employeeId')
  async getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return await this.attendanceService.getEmployeeAttendanceForMonth(
      employeeId,
      year,
      month,
    );
  }

  @Get('site/:siteId')
  async getSiteAttendance(
    @Param('siteId') siteId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.attendanceService.getSiteAttendance(
      siteId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post('bulk')
  async bulkCreateAttendance(
    @Body()
    body: {
      events: Array<{
        employeeId: string;
        siteId: string;
        date: string;
        status: AttendanceStatus;
        hours?: number;
      }>;
      source: AttendanceSource;
      sourceFileId?: string;
      createdBy?: string;
    },
  ) {
    const events = body.events.map((e) => ({
      ...e,
      date: new Date(e.date),
    }));
    return await this.attendanceService.bulkCreateAttendance(
      events,
      body.source,
      body.sourceFileId,
      body.createdBy,
    );
  }

  @Delete(':attendanceId')
  async deleteAttendance(@Param('attendanceId') attendanceId: string) {
    await this.attendanceService.deleteAttendance(attendanceId);
    return { message: 'Attendance deleted successfully' };
  }
}

