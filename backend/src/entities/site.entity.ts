import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { Deployment } from './deployment.entity';
import { AttendanceEvent } from './attendance-event.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  site_id: string;

  @ManyToOne(() => Client, (client) => client.sites)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'int' })
  client_id: number;

  @Column({ type: 'varchar', length: 255 })
  site_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  site_code: string;

  @OneToMany(() => Deployment, (deployment) => deployment.site)
  deployments: Deployment[];

  @OneToMany(() => AttendanceEvent, (attendance) => attendance.site)
  attendance_events: AttendanceEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

