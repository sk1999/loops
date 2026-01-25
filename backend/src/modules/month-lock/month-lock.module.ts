import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthLockController } from './month-lock.controller';
import { MonthLockService } from './month-lock.service';
import { MonthLock } from '../../entities/month-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MonthLock])],
  controllers: [MonthLockController],
  providers: [MonthLockService],
  exports: [MonthLockService],
})
export class MonthLockModule {}

