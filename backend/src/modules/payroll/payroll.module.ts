import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { Payroll } from '../../entities/payroll.entity';
import { AttendanceEvent } from '../../entities/attendance-event.entity';
import { Employee } from '../../entities/employee.entity';
import { TradeCategory } from '../../entities/trade-category.entity';
import { Deployment } from '../../entities/deployment.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { MonthLockModule } from '../month-lock/month-lock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      AttendanceEvent,
      Employee,
      TradeCategory,
      Deployment,
    ]),
    AttendanceModule,
    MonthLockModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}

