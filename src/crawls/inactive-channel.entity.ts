import { PrimaryColumn, Column, UpdateDateColumn, ManyToOne, Entity, Unique } from "typeorm";
import { Server } from '../servers/server.entity';
import { Expose } from "class-transformer";

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

  @Column()
  @Expose()
  isNotified: boolean;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => Server)
  server: Server;
}