import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';
import { ExcelUpload } from '../../entities/excel-upload.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { EmployeeModule } from '../employee/employee.module';
import { DeploymentModule } from '../deployment/deployment.module';
import { SiteModule } from '../site/site.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExcelUpload, Employee, Site]),
    AttendanceModule,
    EmployeeModule,
    DeploymentModule,
    SiteModule,
  ],
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}

