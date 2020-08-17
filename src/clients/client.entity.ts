import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Entity,
  Index,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from '../users/user.entity';
import { Server } from '../servers/server.entity';
import { ClientHistory } from './client-history.entity';
import { Channel } from '../channels/channel.entity';

@Entity()
@Unique('uniq_sv_tsId', ['serverId', 'tsUniqueId'])
@Unique('uniq_sv_tsDbId', ['serverId', 'tsClientDbId'])
@Unique('uniq_sv_client', ['userId', 'serverId', 'tsUniqueId', 'tsClientDbId'])
@Index('idx_sv_tsId', ['serverId', 'tsUniqueId'])
@Index('idx_sv_tsDbId', ['serverId', 'tsClientDbId'])
export class Client {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  userId: number;

  @Column()
  @Expose()
  serverId: number;

  @Column({
    length: 30,
  })
  @Expose()
  tsUniqueId: string;

  @Column()
  @Expose()
  tsClientDbId: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @ManyToOne(
    () => User,
    user => user.clients,
  )
  user: User;

  @ManyToOne(
    () => Server,
    server => server.clients,
  )
  server: Server;

  @OneToMany(
    () => ClientHistory,
    arch => arch.client,
  )
  history: ClientHistory;

  @OneToMany(
    () => Channel,
    channel => channel.client,
  )
  channels: Channel[];
}
