import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Server } from '../servers/server.entity';

@Entity()
@Unique('uniq_server_group', ['tsId', 'serverId'])
export class ServerGroup {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  tsId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  serverId: number;

  @Column()
  @Expose()
  name: string;

  @ManyToOne(
    () => Server,
    server => server.serverGroups,
  )
  server: Server;
}
