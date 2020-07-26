import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { ServerPermission } from '../../server-ref-data/server-permission.entity';
import { Codec } from '../../server-ref-data/codec.entity';

@Entity()
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  id: number;

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
}
