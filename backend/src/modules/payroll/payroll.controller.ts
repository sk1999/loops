import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate')
  async calculatePayroll(
    @Body()
    body: {
      employeeId: string;
      year: number;
      month: number;
      recalculate?: boolean;
    },
  ) {
    return await this.payrollService.calculatePayroll(
      body.employeeId,
      body.year,
      body.month,
      body.recalculate || false,
    );
  }

  @Post('recalculate-month')
  async recalculatePayrollForMonth(
    @Body() body: { year: number; month: number },
  ) {
    return await this.payrollService.recalculatePayrollForMonth(
      body.year,
      body.month,
    );
  }

  @Get('employee/:employeeId')
  async getPayroll(
    @Param('employeeId') employeeId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return await this.payrollService.getPayroll(employeeId, year, month);
  }

  @Get('month')
  async getPayrollForMonth(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return await this.payrollService.getPayrollForMonth(year, month);
  }
}

