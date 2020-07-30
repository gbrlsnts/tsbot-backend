import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Codec } from '../../../server-ref-data/codec.entity';
import { Zone } from '../zone/zone/zone.entity';
import { Server } from '../../server.entity';
import { ChannelConfigPermission } from './channel-perm.entity';
import { Expose } from 'class-transformer';

@Entity()
@Index('uniq_zones_config', {
  synchronize: false,
})
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  serverId: number;

  @Column({
    nullable: true
  })
  @Expose()
  zoneId?: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  allowedSubChannels: number;

  @Column()
  @Expose()
  codecId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  codecQuality: number;

  @ManyToOne(() => Server, server => server.channelConfigs)
  server: Server;

  @OneToMany(
    () => ChannelConfigPermission,
    perm => perm.config,
    { cascade: true, eager: true }
  )
  @Expose()
  permissions: ChannelConfigPermission[];

  @ManyToOne(
    () => Codec,
    codec => codec.channelConfigs,
  )
  @Expose()
  codec: Codec;

  @OneToOne(
    () => Zone,
    zone => zone.channelConfig,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  zone: Zone;
}
