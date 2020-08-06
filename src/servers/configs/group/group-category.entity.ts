import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Server } from '../../server.entity';
import { Expose } from 'class-transformer';
import { GroupConfig } from './group-config.entity';

@Entity()
@Unique('uniq_server_category', ['name', 'serverId'])
export class GroupCategory {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  serverId: number;

  @ManyToOne(
    () => Server,
    server => server.groupCategories,
  )
  server: Server;

  @OneToMany(
    () => GroupConfig,
    group => group.category,
  )
  configs: GroupConfig[];
}
