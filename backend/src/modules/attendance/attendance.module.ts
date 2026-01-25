import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceEvent } from '../../entities/attendance-event.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';
import { ExcelUpload } from '../../entities/excel-upload.entity';
import { MonthLock } from '../../entities/month-lock.entity';
import { MonthLockModule } from '../month-lock/month-lock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceEvent, Employee, Site, ExcelUpload, MonthLock]),
    MonthLockModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}

