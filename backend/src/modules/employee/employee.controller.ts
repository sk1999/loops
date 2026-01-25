import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import { FileUploadService } from './file-upload.service';
import { Employee } from '../../entities/employee.entity';

@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  async findAll() {
    return await this.employeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.employeeService.findOne(id);
  }

  /**
   * Create employee with document uploads
   * Accepts multipart/form-data with:
   * - Employee data fields (JSON stringified or form fields)
   * - passport_document (file)
   * - visa_document (file)
   * - photo (file)
   * - other_documents (multiple files)
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'passport_document', maxCount: 1 },
        { name: 'visa_document', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
        { name: 'other_documents', maxCount: 10 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
      },
    ),
  )
  async create(
    @Body() employeeData: any,
    @UploadedFiles()
    files?: {
      passport_document?: Express.Multer.File[];
      visa_document?: Express.Multer.File[];
      photo?: Express.Multer.File[];
      other_documents?: Express.Multer.File[];
    },
  ) {
    // Parse employee data (could be JSON string or form fields)
    let parsedData: Partial<Employee>;
    if (typeof employeeData === 'string') {
      parsedData = JSON.parse(employeeData);
    } else {
      parsedData = employeeData;
    }

    // Handle file uploads
    const employeeId = parsedData.employee_id || `EMP_${Date.now()}`;
    parsedData.employee_id = employeeId;

    if (files) {
      // Upload passport document
      if (files.passport_document?.[0]) {
        parsedData.passport_document_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employeeId,
            files.passport_document[0],
            'passport',
          );
      }

      // Upload visa document
      if (files.visa_document?.[0]) {
        parsedData.visa_document_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employeeId,
            files.visa_document[0],
            'visa',
          );
      }

      // Upload photo
      if (files.photo?.[0]) {
        parsedData.photo_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employeeId,
            files.photo[0],
            'photo',
          );
      }

      // Upload other documents
      if (files.other_documents && files.other_documents.length > 0) {
        const uploadedDocs = await this.fileUploadService.uploadMultipleDocuments(
          employeeId,
          files.other_documents,
          'other',
        );
        parsedData.other_documents = uploadedDocs.map((doc) => ({
          ...doc,
          uploaded_at: new Date(),
        }));
      }
    }

    return await this.employeeService.create(parsedData);
  }

  /**
   * Update employee with optional document uploads
   */
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'passport_document', maxCount: 1 },
        { name: 'visa_document', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
        { name: 'other_documents', maxCount: 10 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() employeeData: any,
    @UploadedFiles()
    files?: {
      passport_document?: Express.Multer.File[];
      visa_document?: Express.Multer.File[];
      photo?: Express.Multer.File[];
      other_documents?: Express.Multer.File[];
    },
  ) {
    let parsedData: Partial<Employee>;
    if (typeof employeeData === 'string') {
      parsedData = JSON.parse(employeeData);
    } else {
      parsedData = employeeData;
    }

    const employee = await this.employeeService.findOne(id);

    // Handle file uploads
    if (files) {
      if (files.passport_document?.[0]) {
        parsedData.passport_document_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employee.employee_id,
            files.passport_document[0],
            'passport',
          );
      }

      if (files.visa_document?.[0]) {
        parsedData.visa_document_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employee.employee_id,
            files.visa_document[0],
            'visa',
          );
      }

      if (files.photo?.[0]) {
        parsedData.photo_url =
          await this.fileUploadService.uploadEmployeeDocument(
            employee.employee_id,
            files.photo[0],
            'photo',
          );
      }

      if (files.other_documents && files.other_documents.length > 0) {
        const uploadedDocs = await this.fileUploadService.uploadMultipleDocuments(
          employee.employee_id,
          files.other_documents,
          'other',
        );
        const existingDocs = employee.other_documents || [];
        parsedData.other_documents = [
          ...existingDocs,
          ...uploadedDocs.map((doc) => ({
            ...doc,
            uploaded_at: new Date(),
          })),
        ];
      }
    }

    return await this.employeeService.update(id, parsedData);
  }

  /**
   * Upload documents for an existing employee
   */
  @Post(':id/documents')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { documentType: 'passport' | 'visa' | 'photo' | 'other' },
  ) {
    const employee = await this.employeeService.findOne(id);
    const documentType = body.documentType || 'other';

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const updateData: Partial<Employee> = {};

    if (documentType === 'passport' && files[0]) {
      updateData.passport_document_url =
        await this.fileUploadService.uploadEmployeeDocument(
          employee.employee_id,
          files[0],
          'passport',
        );
    } else if (documentType === 'visa' && files[0]) {
      updateData.visa_document_url =
        await this.fileUploadService.uploadEmployeeDocument(
          employee.employee_id,
          files[0],
          'visa',
        );
    } else if (documentType === 'photo' && files[0]) {
      updateData.photo_url =
        await this.fileUploadService.uploadEmployeeDocument(
          employee.employee_id,
          files[0],
          'photo',
        );
    } else {
      const uploadedDocs = await this.fileUploadService.uploadMultipleDocuments(
        employee.employee_id,
        files,
        'other',
      );
      const existingDocs = employee.other_documents || [];
      updateData.other_documents = [
        ...existingDocs,
        ...uploadedDocs.map((doc) => ({
          ...doc,
          uploaded_at: new Date(),
        })),
      ];
    }

    return await this.employeeService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.employeeService.delete(id);
    return { message: 'Employee deleted successfully' };
  }
}

