import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { ExcelUpload, ExcelUploadType, ExcelUploadStatus } from '../../entities/excel-upload.entity';
import { AttendanceEvent, AttendanceStatus, AttendanceSource } from '../../entities/attendance-event.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeeService } from '../employee/employee.service';
import { DeploymentService } from '../deployment/deployment.service';
import { SiteService } from '../site/site.service';

export interface ExcelRow {
  [key: string]: any;
}

export interface ColumnMapping {
  [excelColumn: string]: string; // Maps Excel column to system field
}

@Injectable()
export class ExcelService {
  constructor(
    @InjectRepository(ExcelUpload)
    private excelUploadRepository: Repository<ExcelUpload>,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private deploymentService: DeploymentService,
    private siteService: SiteService,
  ) { }

  /**
   * Auto-detect Excel sheet type and process
   */
  async processExcelFile(
    file: any,
    uploadedBy: string,
    uploadType?: ExcelUploadType,
  ): Promise<ExcelUpload> {
    // Read Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: null,
    });

    if (rows.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    // Auto-detect type if not provided
    if (!uploadType) {
      uploadType = this.detectSheetType(rows);
    }

    // Create upload record
    const upload = this.excelUploadRepository.create({
      filename: file.filename || 'upload.xlsx',
      original_filename: file.originalname,
      upload_type: uploadType,
      status: ExcelUploadStatus.PROCESSING,
      total_rows: rows.length,
      uploaded_by: uploadedBy,
    });

    const savedUpload = await this.excelUploadRepository.save(upload);

    try {
      // Process based on type
      let result;
      switch (uploadType) {
        case ExcelUploadType.ATTENDANCE:
          result = await this.processAttendanceSheet(
            rows,
            savedUpload.upload_id,
            uploadedBy,
          );
          break;
        case ExcelUploadType.EMPLOYEE:
          result = await this.processEmployeeSheet(rows, savedUpload.upload_id);
          break;
        case ExcelUploadType.DEPLOYMENT:
          result = await this.processDeploymentSheet(
            rows,
            savedUpload.upload_id,
          );
          break;
        default:
          throw new BadRequestException(`Unknown upload type: ${uploadType}`);
      }

      // Update upload status
      savedUpload.status =
        result.errors.length === 0
          ? ExcelUploadStatus.COMPLETED
          : result.errors.length < rows.length
            ? ExcelUploadStatus.PARTIAL
            : ExcelUploadStatus.FAILED;
      savedUpload.processed_rows = result.success;
      savedUpload.success_rows = result.success;
      savedUpload.error_rows = result.errors.length;
      savedUpload.errors = result.errors;

      return await this.excelUploadRepository.save(savedUpload);
    } catch (error) {
      savedUpload.status = ExcelUploadStatus.FAILED;
      savedUpload.errors = [
        {
          row: 0,
          field: 'system',
          message: error.message || 'Unknown error',
        },
      ];
      return await this.excelUploadRepository.save(savedUpload);
    }
  }

  /**
   * Auto-detect sheet type based on column headers
   */
  private detectSheetType(rows: ExcelRow[]): ExcelUploadType {
    const headers = Object.keys(rows[0] || {});
    const headerStr = headers.join(' ').toLowerCase();

    // Attendance sheets typically have date columns or attendance symbols
    if (
      headerStr.includes('date') ||
      headerStr.includes('attendance') ||
      headerStr.includes('p') ||
      headerStr.includes('a') ||
      /^\d+$/.test(headers[0]) // First column is a number (day of month)
    ) {
      return ExcelUploadType.ATTENDANCE;
    }

    // Employee sheets have employee fields
    if (
      headerStr.includes('name') ||
      headerStr.includes('employee') ||
      headerStr.includes('passport') ||
      headerStr.includes('visa')
    ) {
      return ExcelUploadType.EMPLOYEE;
    }

    // Deployment sheets have site/client references
    if (
      headerStr.includes('site') ||
      headerStr.includes('deployment') ||
      headerStr.includes('client')
    ) {
      return ExcelUploadType.DEPLOYMENT;
    }

    // Default to attendance (most common)
    return ExcelUploadType.ATTENDANCE;
  }

  /**
   * Process attendance sheet (most complex)
   * Handles Excel format with date columns (E-AH = days 1-30/31)
   */
  private async processAttendanceSheet(
    rows: ExcelRow[],
    sourceFileId: string,
    createdBy: string,
  ): Promise<{ success: number; errors: Array<{ row: number; field: string; message: string }> }> {
    const errors: Array<{ row: number; field: string; message: string }> = [];
    let success = 0;

    // Detect employee identifier column (usually name or ID)
    const headers = Object.keys(rows[0]);
    const employeeColumn = this.findEmployeeColumn(headers);
    const siteColumn = this.findSiteColumn(headers);

    // Find date columns (numeric headers 1-31)
    const dateColumns = headers.filter((h) => /^\d+$/.test(h) && parseInt(h) >= 1 && parseInt(h) <= 31);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed, +1 for header)

      try {
        // Get employee (fuzzy match by name or ID)
        const employeeIdentifier = row[employeeColumn];
        if (!employeeIdentifier) {
          errors.push({
            row: rowNum,
            field: employeeColumn,
            message: 'Employee identifier is required',
          });
          continue;
        }

        const employee = await this.employeeService.findByFuzzyMatch(
          String(employeeIdentifier),
        );
        if (!employee) {
          errors.push({
            row: rowNum,
            field: employeeColumn,
            message: `Employee not found: ${employeeIdentifier}`,
          });
          continue;
        }

        // Get site
        const siteIdentifier = row[siteColumn];
        if (!siteIdentifier) {
          errors.push({
            row: rowNum,
            field: siteColumn || 'site',
            message: 'Site identifier is required',
          });
          continue;
        }

        const site = await this.siteService.findByFuzzyMatch(String(siteIdentifier));
        if (!site) {
          errors.push({
            row: rowNum,
            field: siteColumn || 'site',
            message: `Site not found: ${siteIdentifier}`,
          });
          continue;
        }

        // Process each date column
        for (const dayCol of dateColumns) {
          const day = parseInt(dayCol);
          const statusStr = String(row[dayCol] || '').trim().toUpperCase();

          if (!statusStr || statusStr === '') {
            continue; // Skip empty cells
          }

          // Map Excel status to AttendanceStatus
          const status = this.mapAttendanceStatus(statusStr);
          if (!status) {
            errors.push({
              row: rowNum,
              field: dayCol,
              message: `Invalid attendance status: ${statusStr}`,
            });
            continue;
          }

          // Determine year/month from context (TODO: get from sheet name or metadata)
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1; // TODO: Extract from sheet name or parameter

          const date = new Date(year, month - 1, day);

          try {
            await this.attendanceService.createOrUpdateAttendance(
              employee.employee_id,
              site.site_id,
              date,
              status,
              AttendanceSource.EXCEL,
              sourceFileId,
              createdBy,
            );
            success++;
          } catch (error) {
            errors.push({
              row: rowNum,
              field: dayCol,
              message: error.message || 'Failed to create attendance',
            });
          }
        }
      } catch (error) {
        errors.push({
          row: rowNum,
          field: 'system',
          message: error.message || 'Unknown error',
        });
      }
    }

    return { success, errors };
  }


  /**
   * Find employee identifier column
   */
  private findEmployeeColumn(headers: string[]): string {
    const patterns = ['name', 'employee', 'emp', 'id', 'employee_id', 'employee name'];
    for (const pattern of patterns) {
      const col = headers.find((h) =>
        h.toLowerCase().includes(pattern.toLowerCase()),
      );
      if (col) return col;
    }
    return headers[0]; // Default to first column
  }

  /**
   * Find site identifier column
   */
  private findSiteColumn(headers: string[]): string | null {
    const patterns = ['site', 'location', 'project', 'client'];
    for (const pattern of patterns) {
      const col = headers.find((h) =>
        h.toLowerCase().includes(pattern.toLowerCase()),
      );
      if (col) return col;
    }
    return null;
  }

  /**
   * Map Excel attendance status string to AttendanceStatus enum
   */
  private mapAttendanceStatus(statusStr: string): AttendanceStatus | null {
    const upper = statusStr.toUpperCase().trim();
    const mapping: Record<string, AttendanceStatus> = {
      P: AttendanceStatus.P,
      A: AttendanceStatus.A,
      OT: AttendanceStatus.OT,
      'O/T': AttendanceStatus.OT,
      PH: AttendanceStatus.PH,
      ML: AttendanceStatus.ML,
      OD: AttendanceStatus.OD,
      '8': AttendanceStatus.EIGHT,
      '8.5': AttendanceStatus.EIGHT_FIVE,
      '8.0': AttendanceStatus.EIGHT,
    };
    return mapping[upper] || null;
  }

  /**
   * Process employee sheet
   */
  private async processEmployeeSheet(
    rows: ExcelRow[],
    sourceFileId: string,
  ): Promise<{ success: number; errors: Array<{ row: number; field: string; message: string }> }> {
    // TODO: Implement employee import
    return { success: 0, errors: [] };
  }

  /**
   * Process deployment sheet
   */
  private async processDeploymentSheet(
    rows: ExcelRow[],
    sourceFileId: string,
  ): Promise<{ success: number; errors: Array<{ row: number; field: string; message: string }> }> {
    // TODO: Implement deployment import
    return { success: 0, errors: [] };
  }

  /**
   * Preview Excel file without processing
   */
  async previewExcelFile(file: any): Promise<{
    type: ExcelUploadType;
    rows: ExcelRow[];
    headers: string[];
    mapping: ColumnMapping;
  }> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: null,
    });

    const headers = Object.keys(rows[0] || {});
    const type = this.detectSheetType(rows);
    const mapping = this.generateColumnMapping(headers, type);

    return {
      type,
      rows: rows.slice(0, 10), // Preview first 10 rows
      headers,
      mapping,
    };
  }

  /**
   * Generate column mapping suggestions
   */
  private generateColumnMapping(
    headers: string[],
    type: ExcelUploadType,
  ): ColumnMapping {
    const mapping: ColumnMapping = {};

    // Common mappings based on type
    if (type === ExcelUploadType.ATTENDANCE) {
      headers.forEach((h) => {
        const lower = h.toLowerCase();
        if (lower.includes('name') || lower.includes('employee')) {
          mapping[h] = 'employee';
        } else if (lower.includes('site')) {
          mapping[h] = 'site';
        } else if (/^\d+$/.test(h)) {
          mapping[h] = `day_${h}`;
        }
      });
    }

    return mapping;
  }
}

