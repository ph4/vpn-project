import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum ConfigStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('vpn_configurations')
@Index(['user_id', 'status'])
@Index(['username'])
export class VpnConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  username: string; // IKE username

  @Column()
  password: string; // encrypted password

  @Column({
    type: 'enum',
    enum: ConfigStatus,
    default: ConfigStatus.INACTIVE,
  })
  status: ConfigStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'inet', nullable: true })
  last_connection_ip: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_connection_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
