import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { AttendanceEvent, AttendanceStatus } from '../../entities/attendance-event.entity';
import { Employee, EmployeeStatus } from '../../entities/employee.entity';
import { TradeCategory } from '../../entities/trade-category.entity';
import { Deployment } from '../../entities/deployment.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { MonthLockService } from '../month-lock/month-lock.service';

interface PayrollCalculationResult {
  paid_days: number;
  ot_count: number;
  daily_rate: number;
  salary: number;
  ot_amount: number;
  net_salary: number;
  rule_version: string;
}

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(TradeCategory)
    private tradeCategoryRepository: Repository<TradeCategory>,
    @InjectRepository(Deployment)
    private deploymentRepository: Repository<Deployment>,
    private attendanceService: AttendanceService,
    private monthLockService: MonthLockService,
  ) { }

  /**
   * Calculate payroll for an employee for a specific month
   * This is the core deterministic calculation engine
   */
  async calculatePayroll(
    employeeId: string,
    year: number,
    month: number,
    recalculate: boolean = false,
  ): Promise<Payroll> {
    // Check if month is locked (only allow recalculation if not locked)
    const isLocked = await this.monthLockService.isMonthLocked(year, month);
    if (isLocked && !recalculate) {
      throw new BadRequestException(
        `Month ${year}-${month.toString().padStart(2, '0')} is locked. Cannot calculate payroll.`,
      );
    }

    // Get employee with trade category
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
      relations: ['trade_category'],
    });

    if (!employee) {
      throw new BadRequestException(`Employee ${employeeId} not found`);
    }

    // Get all attendance events for the month (consolidated across all sites)
    const attendanceEvents =
      await this.attendanceService.getEmployeeAttendanceForMonth(
        employeeId,
        year,
        month,
      );

    // Get active deployments for the month to determine daily rate
    const dailyRate = await this.getDailyRate(employeeId, year, month);

    // Get payroll rules from trade category
    const payrollRules = employee.trade_category.payroll_rules;
    if (!payrollRules) {
      throw new BadRequestException(
        `Trade category ${employee.trade_category.code} has no payroll rules configured`,
      );
    }

    // Calculate payroll
    const calculation = this.calculatePayrollAmounts(
      attendanceEvents,
      payrollRules,
      dailyRate,
    );

    // Save or update payroll record
    let payroll = await this.payrollRepository.findOne({
      where: {
        employee_id: employee.id,
        year,
        month,
      },
    });

    if (!payroll) {
      payroll = this.payrollRepository.create({
        employee_id: employee.id,
        year,
        month,
      });
    }

    if (!employee.trade_category) {
      throw new BadRequestException(
        `Employee ${employeeId} has no trade category assigned`,
      );
    }

    // Update with calculated values (NEVER manually edited)
    payroll.paid_days = calculation.paid_days;
    payroll.ot_count = calculation.ot_count;
    payroll.daily_rate = calculation.daily_rate;
    payroll.salary = calculation.salary;
    payroll.ot_amount = calculation.ot_amount;
    payroll.net_salary = calculation.net_salary;
    payroll.rule_version = calculation.rule_version;
    payroll.calculated_at = new Date();
    payroll.calculated_by = 'system'; // TODO: Get from auth context

    return await this.payrollRepository.save(payroll);
  }

  /**
   * Core payroll calculation logic
   * This replicates Excel logic deterministically
   */
  private calculatePayrollAmounts(
    attendanceEvents: AttendanceEvent[],
    payrollRules: {
      paidStatuses: string[];
      otRateType: 'fixed' | 'multiplier';
      otRate: number;
      otMultiplier?: number;
    },
    dailyRate: number,
  ): PayrollCalculationResult {
    // Count paid days based on rule
    const paidStatuses = payrollRules.paidStatuses;
    const paid_days = attendanceEvents.filter((event) =>
      paidStatuses.includes(event.status),
    ).length;

    // Count OT days
    const ot_count = attendanceEvents.filter(
      (event) => event.status === AttendanceStatus.OT,
    ).length;

    // Calculate OT rate
    let otRate = payrollRules.otRate;
    if (payrollRules.otRateType === 'multiplier' && payrollRules.otMultiplier) {
      otRate = dailyRate * payrollRules.otMultiplier;
    }

    // Calculate amounts
    const salary = paid_days * dailyRate;
    const ot_amount = ot_count * otRate;
    const net_salary = salary + ot_amount;

    return {
      paid_days,
      ot_count,
      daily_rate: dailyRate,
      salary,
      ot_amount,
      net_salary,
      rule_version: '1.0', // TODO: Get from trade category
    };
  }

  /**
   * Get daily rate for employee for a specific month
   * Checks for deployment rate overrides first
   */
  private async getDailyRate(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<number> {
    // Get active deployments for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const deployments = await this.deploymentRepository
      .createQueryBuilder('deployment')
      .innerJoin('deployment.employee', 'employee')
      .where('employee.employee_id = :employeeId', { employeeId })
      .andWhere(
        '(deployment.from_date <= :endDate AND (deployment.to_date IS NULL OR deployment.to_date >= :startDate))',
        { startDate, endDate },
      )
      .getMany();

    // If there's a rate override in any deployment, use it
    if (deployments.length > 0 && deployments[0].rate_override) {
      return Number(deployments[0].rate_override);
    }

    // TODO: Get default rate from:
    // 1. Employee record (daily_rate field)
    // 2. Trade category default rate
    // 3. Site default rate
    // For now, throw error if no rate found
    throw new BadRequestException(
      `No daily rate found for employee ${employeeId} for month ${year}-${month}. Please set rate_override in deployment or add daily_rate to employee record.`,
    );
  }

  /**
   * Recalculate payroll for all employees in a month
   * Used when attendance changes or rules are updated
   */
  async recalculatePayrollForMonth(
    year: number,
    month: number,
  ): Promise<{ success: number; errors: string[] }> {
    const employees = await this.employeeRepository.find({
      where: { status: EmployeeStatus.ACTIVE },
      relations: ['trade_category'],
    });

    const errors: string[] = [];
    let success = 0;

    for (const employee of employees) {
      try {
        await this.calculatePayroll(employee.employee_id, year, month, true);
        success++;
      } catch (error) {
        errors.push(
          `Employee ${employee.employee_id}: ${error.message || 'Unknown error'}`,
        );
      }
    }

    return { success, errors };
  }

  /**
   * Get payroll for employee
   */
  async getPayroll(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<Payroll | null> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      return null;
    }

    return await this.payrollRepository.findOne({
      where: {
        employee_id: employee.id,
        year,
        month,
      },
      relations: ['employee'],
    });
  }

  /**
   * Get all payroll for a month
   */
  async getPayrollForMonth(
    year: number,
    month: number,
  ): Promise<Payroll[]> {
    return await this.payrollRepository.find({
      where: { year, month },
      relations: ['employee'],
    });
  }
}

