import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { FileUploadService } from './file-upload.service';
import { EmployeeDocumentController } from '../../controllers/employee-document.controller';
import { Employee } from '../../entities/employee.entity';
import { TradeCategory } from '../../entities/trade-category.entity';
import { UploadedFile } from '../../entities/uploaded-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, TradeCategory, UploadedFile])],
  controllers: [EmployeeController, EmployeeDocumentController],
  providers: [EmployeeService, FileUploadService],
  exports: [EmployeeService],
})
export class EmployeeModule {}

