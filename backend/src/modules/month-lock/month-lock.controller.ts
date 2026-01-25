import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MonthLockService } from './month-lock.service';

@Controller('month-locks')
export class MonthLockController {
  constructor(private readonly monthLockService: MonthLockService) {}

  @Get()
  async getAllLocks() {
    return await this.monthLockService.getAllLocks();
  }

  @Get(':year/:month')
  async getMonthLock(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return await this.monthLockService.getMonthLock(year, month);
  }

  @Post('lock')
  async lockMonth(
    @Body() body: { year: number; month: number; lockedBy: string },
  ) {
    return await this.monthLockService.lockMonth(
      body.year,
      body.month,
      body.lockedBy,
    );
  }

  @Post('unlock')
  async unlockMonth(
    @Body()
    body: {
      year: number;
      month: number;
      unlockedBy: string;
      reason: string;
    },
  ) {
    return await this.monthLockService.unlockMonth(
      body.year,
      body.month,
      body.unlockedBy,
      body.reason,
    );
  }
}

