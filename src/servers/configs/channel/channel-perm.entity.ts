import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm";
import { ChannelConfig } from './channel-config.entity';
import { ServerPermission } from '../../../server-ref-data/server-permission.entity';

@Entity()
export class ChannelConfigPermission {
  @PrimaryColumn()
  permissionId: number;

  @PrimaryColumn()
  configId: number;

  @ManyToOne(() => ServerPermission)
  permission: ServerPermission;
  
  @ManyToOne(() => ChannelConfig, config => config.permissions)
  config: ChannelConfig;

  @Column({
    unsigned: true
  })
  value: number;
}