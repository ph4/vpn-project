import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('radcheck')
@Index(['username', 'attribute'])
export class RadCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', default: '' })
  username: string;

  @Column({ type: 'text', default: '' })
  attribute: string;

  @Column({ type: 'varchar', length: 2, default: '==' })
  op: string;

  @Column({ type: 'text', default: '' })
  value: string;
}
