import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { FileUploadService } from './file-upload.service';
import { Employee } from '../../entities/employee.entity';
import { TradeCategory } from '../../entities/trade-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, TradeCategory])],
  controllers: [EmployeeController],
  providers: [EmployeeService, FileUploadService],
  exports: [EmployeeService],
})
export class EmployeeModule {}

