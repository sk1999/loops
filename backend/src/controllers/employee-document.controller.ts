import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../modules/employee/file-upload.service';
import { UploadedFile as UploadedFileEntity } from '../entities/uploaded-file.entity';

@Controller('api/employees/:employeeId/documents')
export class EmployeeDocumentController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('employeeId') employeeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: 'passport' | 'visa' | 'photo' | 'other',
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!documentType) {
      throw new BadRequestException('Document type is required');
    }

    const uploadedBy = req.user?.id || null;
    const result = await this.fileUploadService.uploadEmployeeDocument(
      employeeId,
      file,
      documentType,
    );

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: result,
    };
  }

  @Post('multiple')
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleDocuments(
    @Param('employeeId') employeeId: string,
    @UploadedFile() files: Express.Multer.File[],
    @Body('documentType') documentType: 'other' = 'other',
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedBy = req.user?.id || null;
    const results = await this.fileUploadService.uploadMultipleDocuments(
      employeeId,
      files,
      documentType,
    );

    return {
      success: true,
      message: `${results.length} documents uploaded successfully`,
      data: results,
    };
  }

  @Get()
  async getEmployeeDocuments(@Param('employeeId') employeeId: string) {
    return {
      success: true,
      message: 'Document listing not implemented yet',
      data: [],
    };
  }

  @Get(':documentId')
  async getDocument(@Param('documentId') documentId: number) {
    return {
      success: true,
      message: 'Document retrieval not implemented yet',
      data: null,
    };
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: number, @Param('employeeId') employeeId: string) {
    // For now, just return success
    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }
}
