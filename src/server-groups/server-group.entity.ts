import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Server } from '../servers/server.entity';
import { GroupConfig } from '../servers/configs/group/group-config.entity';
import { Icon } from '../icons/icon.entity';

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

  @Column({
    nullable: true,
    type: 'uuid',
  })
  @Expose()
  iconId: string;

  @Column()
  @Expose()
  name: string;

  @ManyToOne(
    () => Server,
    server => server.serverGroups,
  )
  server: Server;

  @ManyToOne(() => Icon, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'iconId' })
  icon: Icon;

  @OneToOne(
    () => GroupConfig,
    config => config.group,
  )
  config: GroupConfig;
}
