import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Productivity } from '../../entities/productivity.entity';
import { AttendanceEvent } from '../../entities/attendance-event.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';
import { TradeCategory } from '../../entities/trade-category.entity';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class ProductivityService {
  constructor(
    @InjectRepository(Productivity)
    private productivityRepository: Repository<Productivity>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    private attendanceService: AttendanceService,
  ) {}

  /**
   * Calculate productivity for employee at site for a month
   */
  async calculateProductivity(
    employeeId: string,
    siteId: string,
    year: number,
    month: number,
    productivityRate: number,
  ): Promise<Productivity> {
    // Get employee with trade category
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
      relations: ['trade_category'],
    });

    if (!employee) {
      throw new BadRequestException(`Employee ${employeeId} not found`);
    }

    if (!employee.trade_category) {
      throw new BadRequestException(
        `Employee ${employeeId} has no trade category assigned`,
      );
    }

    // Get attendance events for this employee at this site for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceEvents = await this.attendanceService.getSiteAttendance(
      siteId,
      startDate,
      endDate,
    );

    const employeeAttendance = attendanceEvents.filter(
      (event) => event.employee_id === employee.id,
    );

    // Get productivity rules from trade category
    const productivityRules = employee.trade_category.productivity_rules;
    if (!productivityRules) {
      throw new BadRequestException(
        `Trade category ${employee.trade_category.code} has no productivity rules configured`,
      );
    }

    // Count productivity days based on rule
    const productivityStatuses = productivityRules.productivityStatuses;
    const productivity_days = employeeAttendance.filter((event) =>
      productivityStatuses.includes(event.status),
    ).length;

    // Calculate productivity amount
    const productivity_amount = productivity_days * productivityRate;

    // Get site entity to get numeric ID
    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      throw new BadRequestException(`Site ${siteId} not found`);
    }

    // Save or update productivity record
    let productivity = await this.productivityRepository.findOne({
      where: {
        employee_id: employee.id,
        site_id: site.id,
        year,
        month,
      },
    });

    if (!productivity) {
      productivity = this.productivityRepository.create({
        employee_id: employee.id,
        site_id: site.id,
        year,
        month,
      });
    }

    productivity.productivity_days = productivity_days;
    productivity.productivity_rate = productivityRate;
    productivity.productivity_amount = productivity_amount;
    productivity.rule_version = employee.trade_category.rule_version || '1.0';
    productivity.calculated_at = new Date();

    return await this.productivityRepository.save(productivity);
  }

  /**
   * Get productivity for employee at site
   */
  async getProductivity(
    employeeId: string,
    siteId: string,
    year: number,
    month: number,
  ): Promise<Productivity | null> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      return null;
    }

    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      return null;
    }

    return await this.productivityRepository.findOne({
      where: {
        employee_id: employee.id,
        site_id: site.id,
        year,
        month,
      },
      relations: ['employee', 'site'],
    });
  }

  /**
   * Get all productivity for a site and month
   */
  async getProductivityForSite(
    siteId: string,
    year: number,
    month: number,
  ): Promise<Productivity[]> {
    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      throw new BadRequestException(`Site ${siteId} not found`);
    }

    return await this.productivityRepository.find({
      where: {
        site_id: site.id,
        year,
        month,
      },
      relations: ['employee'],
      order: { employee: { full_name: 'ASC' } },
    });
  }
}

