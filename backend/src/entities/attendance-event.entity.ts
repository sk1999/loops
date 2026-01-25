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

export enum AttendanceStatus {
  P = 'P', // Present
  A = 'A', // Absent
  OT = 'OT', // Overtime
  PH = 'PH', // Public Holiday
  ML = 'ML', // Medical Leave
  OD = 'OD', // On Duty
  EIGHT = '8', // 8-hour shift
  EIGHT_FIVE = '8.5', // 8.5-hour shift
}

export enum AttendanceSource {
  EXCEL = 'EXCEL',
  UI = 'UI',
}

@Entity('attendance_events')
@Index(['employee_id', 'site_id', 'date'], { unique: true })
export class AttendanceEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  attendance_id: string;

  @ManyToOne(() => Employee, (employee) => employee.attendance_events)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Site, (site) => site.attendance_events)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ type: 'int' })
  site_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hours: number; // Optional hours for OT or custom shifts

  @Column({
    type: 'enum',
    enum: AttendanceSource,
  })
  source: AttendanceSource;

  @Column({ type: 'int', nullable: true })
  source_file_id: number; // Reference to uploaded Excel file

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string; // User ID or email

  @CreateDateColumn()
  timestamp: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

