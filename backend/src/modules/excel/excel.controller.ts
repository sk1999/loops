import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { ExcelUploadType } from '../../entities/excel-upload.entity';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: any,
    @Body() body: { uploadType?: ExcelUploadType; uploadedBy: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return await this.excelService.processExcelFile(
      file,
      body.uploadedBy || 'system',
      body.uploadType,
    );
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async previewExcel(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return await this.excelService.previewExcelFile(file);
  }

  @Get('uploads')
  async getAllUploads() {
    // TODO: Implement
    return [];
  }

  @Get('uploads/:uploadId')
  async getUpload(@Param('uploadId') uploadId: string) {
    // TODO: Implement
    return { uploadId };
  }
}
