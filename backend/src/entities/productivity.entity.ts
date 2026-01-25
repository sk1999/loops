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
import { Site } from './site.entity';

@Entity('productivity')
@Index(['employee_id', 'site_id', 'year', 'month'], { unique: true })
export class Productivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  productivity_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ type: 'int' })
  site_id: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number; // 1-12

  // Derived values
  @Column({ type: 'integer' })
  productivity_days: number; // Count based on productivityStatuses

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productivity_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productivity_amount: number; // productivity_days × productivity_rate

  // Audit fields
  @Column({ type: 'varchar', length: 50 })
  rule_version: string;

  @Column({ type: 'timestamp' })
  calculated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

