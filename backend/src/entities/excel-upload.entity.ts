import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExcelUploadType {
  EMPLOYEE = 'EMPLOYEE',
  DEPLOYMENT = 'DEPLOYMENT',
  ATTENDANCE = 'ATTENDANCE',
}

export enum ExcelUploadStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

@Entity('excel_uploads')
export class ExcelUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  upload_id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename: string;

  @Column({
    type: 'enum',
    enum: ExcelUploadType,
  })
  upload_type: ExcelUploadType;

  @Column({
    type: 'enum',
    enum: ExcelUploadStatus,
    default: ExcelUploadStatus.PENDING,
  })
  status: ExcelUploadStatus;

  @Column({ type: 'integer', default: 0 })
  total_rows: number;

  @Column({ type: 'integer', default: 0 })
  processed_rows: number;

  @Column({ type: 'integer', default: 0 })
  success_rows: number;

  @Column({ type: 'integer', default: 0 })
  error_rows: number;

  @Column({ type: 'json', nullable: true })
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;

  @Column({ type: 'json', nullable: true })
  mapping: Record<string, string>; // Column mapping

  @Column({ type: 'varchar', length: 255 })
  uploaded_by: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

