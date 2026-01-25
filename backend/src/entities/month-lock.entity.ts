import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('month_locks')
@Index(['year', 'month'], { unique: true })
export class MonthLock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  lock_id: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number; // 1-12

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locked_by: string;

  @Column({ type: 'timestamp', nullable: true })
  locked_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  unlocked_by: string;

  @Column({ type: 'text', nullable: true })
  unlock_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  unlocked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

