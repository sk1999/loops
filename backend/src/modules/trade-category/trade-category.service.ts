import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeCategory } from '../../entities/trade-category.entity';

@Injectable()
export class TradeCategoryService {
  constructor(
    @InjectRepository(TradeCategory)
    private tradeCategoryRepository: Repository<TradeCategory>,
  ) { }

  async findAll(): Promise<TradeCategory[]> {
    return await this.tradeCategoryRepository.find({
      order: { code: 'ASC' },
    });
  }

  async findOne(tradeCategoryId: string): Promise<TradeCategory> {
    const category = await this.tradeCategoryRepository.findOne({
      where: { trade_category_id: tradeCategoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Trade category ${tradeCategoryId} not found`,
      );
    }

    return category;
  }

  async findByCode(code: string): Promise<TradeCategory | null> {
    return await this.tradeCategoryRepository.findOne({
      where: { code },
    });
  }

  async create(
    categoryData: Partial<TradeCategory>,
  ): Promise<TradeCategory> {
    const category = this.tradeCategoryRepository.create(categoryData);
    return await this.tradeCategoryRepository.save(category);
  }

  async update(
    tradeCategoryId: string,
    categoryData: Partial<TradeCategory>,
  ): Promise<TradeCategory> {
    const category = await this.findOne(tradeCategoryId);
    Object.assign(category, categoryData);
    return await this.tradeCategoryRepository.save(category);
  }

  async delete(tradeCategoryId: string): Promise<void> {
    const category = await this.findOne(tradeCategoryId);
    await this.tradeCategoryRepository.remove(category);
  }

  /**
   * Initialize default trade categories with rules
   */
  async initializeDefaultCategories(): Promise<void> {
    const defaults: Partial<TradeCategory>[] = [
      {
        code: 'CLEANER',
        name: 'Cleaner',
        payroll_rules: {
          paidStatuses: ['P', 'OT'],
          otRateType: 'multiplier',
          otRate: 0,
          otMultiplier: 1.5,
        },
        productivity_rules: {
          productivityStatuses: ['P', 'OT'],
        },
        rule_version: '1.0',
      },
      {
        code: 'MEP',
        name: 'MEP',
        payroll_rules: {
          paidStatuses: ['P', 'PH', 'ML', 'OD'],
          otRateType: 'multiplier',
          otRate: 0,
          otMultiplier: 1.5,
        },
        productivity_rules: {
          productivityStatuses: ['P'],
        },
        rule_version: '1.0',
      },
      {
        code: 'MASON',
        name: 'Mason',
        payroll_rules: {
          paidStatuses: ['P', 'PH', 'ML', 'OD'],
          otRateType: 'multiplier',
          otRate: 0,
          otMultiplier: 1.5,
        },
        productivity_rules: {
          productivityStatuses: ['P'],
        },
        rule_version: '1.0',
      },
      {
        code: 'CIVIL',
        name: 'Civil',
        payroll_rules: {
          paidStatuses: ['P', 'PH', 'ML', 'OD'],
          otRateType: 'multiplier',
          otRate: 0,
          otMultiplier: 1.5,
        },
        productivity_rules: {
          productivityStatuses: ['P'],
        },
        rule_version: '1.0',
      },
    ];

    for (const defaultCategory of defaults) {
      const existing = await this.findByCode(defaultCategory.code);
      if (!existing) {
        await this.create(defaultCategory);
      }
    }
  }
}

