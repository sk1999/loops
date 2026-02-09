import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 255 })
  storedName: string;

  @Column({ length: 500 })
  filePath: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: ['excel_attendance', 'excel_payroll', 'exports_payroll', 'exports_productivity', 'employee_passport', 'employee_visa', 'employee_photo', 'employee_other']
  })
  category: string;

  @Column({ nullable: true })
  uploadedBy: number;

  @CreateDateColumn()
  uploadDate: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
