import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductivityController } from './productivity.controller';
import { ProductivityService } from './productivity.service';
import { Productivity } from '../../entities/productivity.entity';
import { AttendanceEvent } from '../../entities/attendance-event.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';
import { TradeCategory } from '../../entities/trade-category.entity';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Productivity,
      AttendanceEvent,
      Employee,
      Site,
      TradeCategory,
    ]),
    AttendanceModule,
  ],
  controllers: [ProductivityController],
  providers: [ProductivityService],
  exports: [ProductivityService],
})
export class ProductivityModule {}

