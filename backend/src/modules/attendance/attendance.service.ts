import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceEvent, AttendanceStatus, AttendanceSource } from '../../entities/attendance-event.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';
import { ExcelUpload } from '../../entities/excel-upload.entity';
import { MonthLockService } from '../month-lock/month-lock.service';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEvent)
    private attendanceRepository: Repository<AttendanceEvent>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(ExcelUpload)
    private excelUploadRepository: Repository<ExcelUpload>,
    private monthLockService: MonthLockService,
  ) {}

  /**
   * Create or update attendance event
   * Handles conflict resolution explicitly
   */
  async createOrUpdateAttendance(
    employeeId: string,
    siteId: string,
    date: Date,
    status: AttendanceStatus,
    source: AttendanceSource,
    sourceFileId?: string,
    createdBy?: string,
    hours?: number,
  ): Promise<AttendanceEvent> {
    // Check if month is locked
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const isLocked = await this.monthLockService.isMonthLocked(year, month);
    if (isLocked) {
      throw new ConflictException(
        `Month ${year}-${month.toString().padStart(2, '0')} is locked. Cannot modify attendance.`,
      );
    }

    // Get employee and site entities first to get their numeric IDs
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException(`Employee ${employeeId} not found`);
    }

    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      throw new BadRequestException(`Site ${siteId} not found`);
    }

    // Check for existing attendance
    const existing = await this.attendanceRepository.findOne({
      where: {
        employee_id: employee.id,
        site_id: site.id,
        date: dateObj,
      },
    });

    if (existing && existing.source !== source) {
      // Conflict: different source
      throw new ConflictException(
        `Attendance already exists from ${existing.source}. Please resolve conflict manually.`,
      );
    }

    // Get source_file_id numeric ID if provided
    let sourceFileIdNum: number | undefined;
    if (sourceFileId) {
      // sourceFileId is upload_id (string), need to look up ExcelUpload entity
      const excelUpload = await this.excelUploadRepository.findOne({
        where: { upload_id: sourceFileId },
      });
      if (excelUpload) {
        sourceFileIdNum = excelUpload.id;
      }
    }

    // Create or update
    if (existing) {
      existing.status = status;
      existing.hours = hours;
      existing.updated_at = new Date();
      return await this.attendanceRepository.save(existing);
    }

    const attendance = this.attendanceRepository.create({
      employee_id: employee.id,
      site_id: site.id,
      date: dateObj,
      status,
      hours,
      source,
      source_file_id: sourceFileIdNum,
      created_by: createdBy,
    });

    return await this.attendanceRepository.save(attendance);
  }

  /**
   * Get attendance for employee across all sites for a month
   * This is the consolidation step for payroll
   */
  async getEmployeeAttendanceForMonth(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<AttendanceEvent[]> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException(`Employee ${employeeId} not found`);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    return await this.attendanceRepository.find({
      where: {
        employee_id: employee.id,
        date: Between(startDate, endDate),
      },
      relations: ['site'],
      order: { date: 'ASC' },
    });
  }

  /**
   * Get attendance for a specific site and date range
   */
  async getSiteAttendance(
    siteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceEvent[]> {
    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      throw new BadRequestException(`Site ${siteId} not found`);
    }

    return await this.attendanceRepository.find({
      where: {
        site_id: site.id,
        date: Between(startDate, endDate),
      },
      relations: ['employee'],
      order: { date: 'ASC', employee: { full_name: 'ASC' } },
    });
  }

  /**
   * Bulk create attendance events
   * Used for Excel imports
   */
  async bulkCreateAttendance(
    events: Array<{
      employeeId: string;
      siteId: string;
      date: Date;
      status: AttendanceStatus;
      hours?: number;
    }>,
    source: AttendanceSource,
    sourceFileId?: string,
    createdBy?: string,
  ): Promise<{ success: number; errors: Array<{ row: number; error: string }> }> {
    const errors: Array<{ row: number; error: string }> = [];
    let success = 0;

    for (let i = 0; i < events.length; i++) {
      try {
        await this.createOrUpdateAttendance(
          events[i].employeeId,
          events[i].siteId,
          events[i].date,
          events[i].status,
          source,
          sourceFileId,
          createdBy,
          events[i].hours,
        );
        success++;
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message || 'Unknown error',
        });
      }
    }

    return { success, errors };
  }

  /**
   * Delete attendance event (with month lock check)
   */
  async deleteAttendance(attendanceId: string): Promise<void> {
    const attendance = await this.attendanceRepository.findOne({
      where: { attendance_id: attendanceId },
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    const dateObj = attendance.date;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const isLocked = await this.monthLockService.isMonthLocked(year, month);
    if (isLocked) {
      throw new ConflictException(
        `Month ${year}-${month.toString().padStart(2, '0')} is locked. Cannot delete attendance.`,
      );
    }

    await this.attendanceRepository.remove(attendance);
  }
}

