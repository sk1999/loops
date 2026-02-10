import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { TradeCategory } from '../../entities/trade-category.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      relations: ['trade_category'],
      order: { full_name: 'ASC' },
    });
  }

  async findOne(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
      relations: ['trade_category'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    return employee;
  }

  async create(employeeData: Partial<Employee>): Promise<Employee> {
    // Handle trade_category_id separately if provided
    const { trade_category_id, ...restEmployeeData } = employeeData;
    
    // Create the employee first without the trade category
    const employee = this.employeeRepository.create(restEmployeeData);
    
    // If trade_category_id is provided, find and associate the trade category
    if (trade_category_id) {
      const tradeCategory = await this.employeeRepository.manager
        .getRepository(TradeCategory)
        .findOne({ where: { id: trade_category_id } });
      
      if (tradeCategory) {
        employee.trade_category = tradeCategory;
      }
    }
    
    return await this.employeeRepository.save(employee);
  }

  async update(
    employeeId: string,
    employeeData: Partial<Employee>,
  ): Promise<Employee> {
    const employee = await this.findOne(employeeId);
    Object.assign(employee, employeeData);
    return await this.employeeRepository.save(employee);
  }

  async delete(employeeId: string): Promise<void> {
    const employee = await this.findOne(employeeId);
    await this.employeeRepository.remove(employee);
  }

  /**
   * Fuzzy match employee by name or ID
   */
  async findByFuzzyMatch(identifier: string): Promise<Employee | null> {
    // Try exact match on employee_id first
    const byId = await this.employeeRepository.findOne({
      where: { employee_id: identifier },
    });
    if (byId) return byId;

    // Try fuzzy match on name
    const byName = await this.employeeRepository.findOne({
      where: { full_name: ILike(`%${identifier}%`) },
    });
    if (byName) return byName;

    // Try passport number
    const byPassport = await this.employeeRepository.findOne({
      where: { passport_number: identifier },
    });
    if (byPassport) return byPassport;

    return null;
  }
}

