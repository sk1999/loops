import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { UploadedFile } from '../entities/uploaded-file.entity';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = process.env.UPLOAD_DIR || '/var/www/uploads';
  private readonly urlBase = process.env.FILE_URL_BASE || 'https://api.shreyask.tech/uploads';

  constructor(
    @InjectRepository(UploadedFile)
    private uploadedFileRepository: Repository<UploadedFile>,
  ) {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const directories = [
      join(this.uploadDir, 'excel', 'attendance'),
      join(this.uploadDir, 'excel', 'payroll'),
      join(this.uploadDir, 'excel', 'reports'),
      join(this.uploadDir, 'exports', 'payroll'),
      join(this.uploadDir, 'exports', 'productivity'),
      join(this.uploadDir, 'temp'),
    ];

    directories.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  async uploadExcelFile(
    file: Express.Multer.File,
    category: 'excel_attendance' | 'excel_payroll',
    uploadedBy?: string,
  ): Promise<{ url: string; fileId: number }> {
    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only Excel files are allowed.');
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // Generate unique filename
    const fileExtension = this.getFileExtension(file.originalname);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${uniqueId}${fileExtension}`;

    // Determine category directory
    const categoryDir = category === 'excel_attendance' ? 'excel/attendance' : 'excel/payroll';
    const filePath = join(this.uploadDir, categoryDir, uniqueFileName);

    // Save file
    writeFileSync(filePath, file.buffer);

    // Generate URL
    const url = `${this.urlBase}/${categoryDir}/${uniqueFileName}`;

    // Save to database
    const uploadedFile = this.uploadedFileRepository.create({
      originalName: file.originalname,
      storedName: uniqueFileName,
      filePath: filePath,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.mimetype,
      category: category,
      uploadedBy: uploadedBy ? parseInt(uploadedBy) : null,
    });

    const savedFile = await this.uploadedFileRepository.save(uploadedFile);

    return {
      url,
      fileId: savedFile.id,
    };
  }

  async uploadExportFile(
    data: Buffer,
    filename: string,
    category: 'exports_payroll' | 'exports_productivity',
  ): Promise<{ url: string; fileId: number }> {
    const categoryDir = category === 'exports_payroll' ? 'exports/payroll' : 'exports/productivity';
    const filePath = join(this.uploadDir, categoryDir, filename);

    // Save file
    writeFileSync(filePath, data);

    // Generate URL
    const url = `${this.urlBase}/${categoryDir}/${filename}`;

    // Save to database
    const uploadedFile = this.uploadedFileRepository.create({
      originalName: filename,
      storedName: filename,
      filePath: filePath,
      fileUrl: url,
      fileSize: data.length,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      category: category,
    });

    const savedFile = await this.uploadedFileRepository.save(uploadedFile);

    return {
      url,
      fileId: savedFile.id,
    };
  }

  async uploadEmployeeDocument(
    employeeId: string,
    file: Express.Multer.File,
    documentType: 'passport' | 'visa' | 'photo' | 'other',
    uploadedBy?: string,
  ): Promise<{ url: string; fileId: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Create employee-specific directory
    const employeeDir = join(this.uploadDir, 'employees', employeeId);
    if (!existsSync(employeeDir)) {
      mkdirSync(employeeDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = this.getFileExtension(file.originalname);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const uniqueFileName = `${documentType}_${timestamp}_${uniqueId}${fileExtension}`;
    const filePath = join(employeeDir, uniqueFileName);

    // Save file
    writeFileSync(filePath, file.buffer);

    // Generate URL
    const url = `${this.urlBase}/employees/${employeeId}/${uniqueFileName}`;

    // Map document type to database category
    const categoryMap = {
      'passport': 'employee_passport',
      'visa': 'employee_visa',
      'photo': 'employee_photo',
      'other': 'employee_other'
    };

    // Save to database
    const uploadedFile = this.uploadedFileRepository.create({
      originalName: file.originalname,
      storedName: uniqueFileName,
      filePath: filePath,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.mimetype,
      category: categoryMap[documentType],
      uploadedBy: uploadedBy ? parseInt(uploadedBy) : null,
    });

    const savedFile = await this.uploadedFileRepository.save(uploadedFile);

    return {
      url,
      fileId: savedFile.id,
    };
  }

  async uploadMultipleDocuments(
    employeeId: string,
    files: Express.Multer.File[],
    documentType: 'other' = 'other',
    uploadedBy?: string,
  ): Promise<Array<{ name: string; url: string; type: string; fileId: number }>> {
    const uploadedFiles = [];

    for (const file of files) {
      const result = await this.uploadEmployeeDocument(
        employeeId,
        file,
        documentType,
        uploadedBy,
      );
      uploadedFiles.push({
        name: file.originalname,
        url: result.url,
        type: file.mimetype,
        fileId: result.fileId,
      });
    }

    return uploadedFiles;
  }

  async getEmployeeDocuments(employeeId: string): Promise<UploadedFile[]> {
    return this.uploadedFileRepository.find({
      where: {
        category: In(['employee_passport', 'employee_visa', 'employee_photo', 'employee_other']),
        filePath: Like(`%/employees/${employeeId}/%`),
        isDeleted: false,
      },
      order: { uploadDate: 'DESC' },
    });
  }

  async getDocumentById(fileId: number): Promise<UploadedFile> {
    const file = await this.uploadedFileRepository.findOne({
      where: { id: fileId, isDeleted: false },
    });
    
    if (!file) {
      throw new BadRequestException('Document not found');
    }
    
    return file;
  }

  async deleteDocumentById(fileId: number): Promise<void> {
    const file = await this.getDocumentById(fileId);
    
    // Delete physical file
    if (existsSync(file.filePath)) {
      const { unlinkSync } = require('fs');
      unlinkSync(file.filePath);
    }
    
    // Mark as deleted in database
    file.isDeleted = true;
    await this.uploadedFileRepository.save(file);
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }

  getFileUrl(filePath: string): string {
    return filePath; // Already relative path, frontend will prepend API base URL
  }
}
