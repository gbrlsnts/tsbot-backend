import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ChannelConfig } from './channel-config.entity';
import { ServerPermission } from '../../../server-ref-data/server-permission.entity';
import { Expose } from 'class-transformer';

@Entity()
export class ChannelConfigPermission {
  @PrimaryColumn()
  @Expose()
  permissionId: number;

  @PrimaryColumn()
  configId: number;

  @ManyToOne(() => ServerPermission)
  @Expose()
  permission: ServerPermission;

  @ManyToOne(
    () => ChannelConfig,
    config => config.permissions,
  )
  config: ChannelConfig;

  @Column({
    unsigned: true,
  })
  @Expose()
  value: number;
}
