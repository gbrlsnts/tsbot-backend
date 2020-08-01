import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
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
    { onDelete: 'CASCADE' },
  )
  config: ChannelConfig;

  @Column({
    unsigned: true,
  })
  @Expose()
  value: number;

  /**
   * Initialize this entity with data
   * @param init properties to initialize the dto with
   */
  constructor(init?: Partial<ChannelConfigPermission>) {
    Object.assign(this, init);
  }
}
