import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('payroll')
@Index(['employee_id', 'year', 'month'], { unique: true })
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  payroll_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int' })
  employee_id: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number; // 1-12

  // Derived values - NEVER manually edited
  @Column({ type: 'integer' })
  paid_days: number;

  @Column({ type: 'integer' })
  ot_count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  daily_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number; // paid_days × daily_rate

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ot_amount: number; // ot_count × ot_rate

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  net_salary: number; // salary + ot_amount

  // Audit fields
  @Column({ type: 'varchar', length: 50 })
  rule_version: string;

  @Column({ type: 'timestamp' })
  calculated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  calculated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

