import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Codec } from '../../../server-ref-data/codec.entity';
import { Zone } from '../zone/zone/zone.entity';
import { Server } from '../../server.entity';
import { ChannelConfigPermission } from './channel-perm.entity';

@Entity()
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serverId: number;

  @Column({
    nullable: true
  })
  zoneId?: number;

  @Column({
    unsigned: true,
  })
  allowedSubChannels: number;

  @Column()
  codecId: number;

  @Column({
    unsigned: true,
  })
  codecQuality: number;

  @ManyToOne(() => Server, server => server.channelConfigs)
  server: Server;

  @OneToMany(
    () => ChannelConfigPermission,
    perm => perm.config,
  )
  permissions: ChannelConfigPermission[];

  @ManyToOne(
    () => Codec,
    codec => codec.channelConfigs,
  )
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
