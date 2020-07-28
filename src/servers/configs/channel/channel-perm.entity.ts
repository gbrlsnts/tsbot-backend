import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChannelConfig } from './channel-config.entity';
import { ServerPermission } from '../../../server-ref-data/server-permission.entity';

@Entity()
@Unique('uniq_perm', ['permissionId', 'configId'])
export class ChannelConfigPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permissionId: number;

  @Column()
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