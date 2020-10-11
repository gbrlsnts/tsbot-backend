import { PrimaryColumn, Column, ManyToOne, Entity, Unique } from 'typeorm';
import { Server } from '../servers/server.entity';
import { Expose } from 'class-transformer';

@Entity()
@Unique('uniq_inactive_sv', ['serverId', 'tsChannelId'])
export class InactiveChannel {
  @PrimaryColumn()
  serverId: number;

  @PrimaryColumn()
  @Expose()
  tsChannelId: number;

  @Column()
  @Expose()
  timeInactive: number;

  @Column({ default: false })
  @Expose()
  isNotified: boolean;

  @Column()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => Server)
  server: Server;
}
