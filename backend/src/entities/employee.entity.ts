import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Deployment } from './deployment.entity';
import { AttendanceEvent } from './attendance-event.entity';
import { TradeCategory } from './trade-category.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  EXITED = 'exited',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  employee_id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  father_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mother_name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'text', nullable: true })
  indian_address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  indian_phone: string;

  @Column({ type: 'text', nullable: true })
  emergency_contact: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  passport_number: string;

  @Column({ type: 'date', nullable: true })
  passport_expiry: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  visa_type: string;

  @Column({ type: 'date', nullable: true })
  visa_expiry: Date;

  // Document URLs (stored in backend/uploads/employees/{employee_id}/)
  @Column({ type: 'varchar', length: 500, nullable: true })
  passport_document_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  visa_document_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo_url: string;

  @Column({ type: 'json', nullable: true })
  other_documents: Array<{
    name: string;
    url: string;
    type: string;
    uploaded_at: Date;
  }>;

  @ManyToOne(() => TradeCategory, { nullable: true })
  @JoinColumn({ name: 'trade_category_id' })
  trade_category: TradeCategory;

  @Column({ type: 'int', nullable: true })
  trade_category_id: number;

  @Column({ type: 'date', nullable: true })
  joining_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recruitment_agency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basic_salary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  food_allowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  foreman_allowance: number;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @OneToMany(() => Deployment, (deployment) => deployment.employee)
  deployments: Deployment[];

  @OneToMany(() => AttendanceEvent, (attendance) => attendance.employee)
  attendance_events: AttendanceEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

