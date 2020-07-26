import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ServerPermission } from '../../../server-ref-data/server-permission.entity';
import { Codec } from '../../../server-ref-data/codec.entity';
import { Zone } from '../zone/zone/zone.entity';

@Entity()
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  zoneId: number;

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

  @ManyToMany(
    () => ServerPermission,
    perm => perm.channelConfigs,
  )
  @JoinTable({
    name: 'channel_config_perm',
  })
  permissions: ServerPermission[];

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
