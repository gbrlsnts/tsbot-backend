import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChannelConfig } from './channel-config.entity';
import { ServerPermission } from '../../../metadata/server-permission.entity';
import { Expose } from 'class-transformer';
import { Server } from '../../server.entity';

@Entity()
export class ChannelConfigPermission {
  @PrimaryColumn()
  @Expose()
  permissionId: number;

  @PrimaryColumn()
  configId: number;

  @Column()
  serverId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  value: number;

  @ManyToOne(() => ServerPermission, {
    eager: true,
  })
  permission: ServerPermission;

  @ManyToOne(
    () => ChannelConfig,
    config => config.permissions,
    { onDelete: 'CASCADE' },
  )
  config: ChannelConfig;

  @ManyToOne(() => Server)
  server: Server;

  /**
   * Initialize this entity with data
   * @param init properties to initialize the dto with
   */
  constructor(init?: Partial<ChannelConfigPermission>) {
    Object.assign(this, init);
  }
}
