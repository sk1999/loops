import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('trade_categories')
export class TradeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  trade_category_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // CLEANER, MEP, MASON, CIVIL

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'json', nullable: true })
  payroll_rules: {
    paidStatuses: string[]; // ['P', 'OT'] for CLEANER, ['P', 'PH', 'ML', 'OD'] for MEP/MASON
    otRateType: 'fixed' | 'multiplier';
    otRate: number;
    otMultiplier?: number;
  };

  @Column({ type: 'json', nullable: true })
  productivity_rules: {
    productivityStatuses: string[]; // ['P'] for MEP/MASON, ['P', 'OT'] for CLEANER
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  rule_version: string;

  @OneToMany(() => Employee, (employee) => employee.trade_category)
  employees: Employee[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

