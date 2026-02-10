import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadsBasePath = process.env.UPLOAD_DIR || '/app/uploads';
  private readonly employeesPath = join(this.uploadsBasePath, 'employees');

  constructor() {
    // Ensure upload directories exist
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    if (!existsSync(this.uploadsBasePath)) {
      mkdirSync(this.uploadsBasePath, { recursive: true });
    }
    if (!existsSync(this.employeesPath)) {
      mkdirSync(this.employeesPath, { recursive: true });
    }
  }

  /**
   * Upload a file for an employee
   * @param employeeId - Employee ID
   * @param file - Multer file object
   * @param documentType - Type of document (passport, visa, photo, other)
   * @returns URL path for the uploaded file
   */
  async uploadEmployeeDocument(
    employeeId: string,
    file: Express.Multer.File,
    documentType: 'passport' | 'visa' | 'photo' | 'other',
  ): Promise<string> {
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
    const employeeDir = join(this.employeesPath, employeeId);
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

    // Return URL path (relative to uploads directory)
    return `/uploads/employees/${employeeId}/${uniqueFileName}`;
  }

  /**
   * Upload multiple files for an employee
   */
  async uploadMultipleDocuments(
    employeeId: string,
    files: Express.Multer.File[],
    documentType: 'other' = 'other',
  ): Promise<Array<{ name: string; url: string; type: string }>> {
    const uploadedFiles = [];

    for (const file of files) {
      const url = await this.uploadEmployeeDocument(
        employeeId,
        file,
        documentType,
      );
      uploadedFiles.push({
        name: file.originalname,
        url,
        type: file.mimetype,
      });
    }

    return uploadedFiles;
  }

  /**
   * Delete a document file
   */
  async deleteDocument(fileUrl: string): Promise<void> {
    const filePath = join(this.uploadsBasePath, fileUrl.replace('/uploads/', ''));
    if (existsSync(filePath)) {
      const { unlinkSync } = require('fs');
      unlinkSync(filePath);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }

  /**
   * Get the base URL for file access
   */
  getFileUrl(filePath: string): string {
    return filePath; // Already relative path, frontend will prepend API base URL
  }
}
