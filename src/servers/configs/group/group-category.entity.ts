import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Server } from '../../server.entity';
import { Expose } from 'class-transformer';
import { GroupConfig } from './group-config.entity';
import { ServerGroup } from '../../../server-groups/server-group.entity';

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
  @Index()
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

  @Expose()
  groups(): ServerGroup[] {
    if (!this.configs) return;

    return this.configs.map(config => {
      return config.group;
    });
  }
}
