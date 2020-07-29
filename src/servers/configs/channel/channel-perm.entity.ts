import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChannelConfig } from './channel-config.entity';
import { ServerPermission } from '../../../server-ref-data/server-permission.entity';
import { Expose } from "class-transformer";

@Entity()
@Unique('uniq_perm', ['permissionId', 'configId'])
export class ChannelConfigPermission {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  permissionId: number;

  @Column()
  @Expose()
  configId: number;

  @ManyToOne(() => ServerPermission)
  @Expose()
  permission: ServerPermission;
  
  @ManyToOne(() => ChannelConfig, config => config.permissions)
  config: ChannelConfig;

  @Column({
    unsigned: true
  })
  @Expose()
  value: number;
}