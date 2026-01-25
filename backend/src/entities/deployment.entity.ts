import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Site } from './site.entity';

@Entity('deployments')
export class Deployment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  deployment_id: string;

  @ManyToOne(() => Employee, (employee) => employee.deployments)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Site, (site) => site.deployments)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ type: 'int' })
  site_id: number;

  @Column({ type: 'date' })
  from_date: Date;

  @Column({ type: 'date', nullable: true })
  to_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rate_override: number; // Optional override for daily rate

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

