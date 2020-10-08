import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Codec } from '../../../metadata/codec.entity';
import { Zone } from '../zone/zone.entity';
import { Server } from '../../server.entity';
import { ChannelConfigPermission } from './channel-perm.entity';
import { Expose } from 'class-transformer';
import { ChannelGroup } from '../../../server-groups/channel-group.entity';
import {
  AudioQuality,
  BotCodec,
  ChannelPermission,
} from 'src/teamspeak/types/channel';

export type ChannelConfigRelations =
  | 'server'
  | 'permissions'
  | 'codec'
  | 'zone'
  | 'adminGroup';

@Entity()
@Unique('uniq_zones_config', ['serverId', 'zoneId'])
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Index()
  serverId: number;

  @Column()
  zoneId: number;

  @Column({ nullable: true })
  adminChannelGroupId?: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  allowedSubChannels: number;

  @Column()
  codecId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  codecQuality: number;

  @ManyToOne(
    () => Server,
    server => server.channelConfigs,
  )
  server: Server;

  @OneToMany(
    () => ChannelConfigPermission,
    perm => perm.config,
    { persistence: false },
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
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  @Expose()
  zone: Zone;

  @ManyToOne(() => ChannelGroup)
  @JoinColumn({ name: 'adminChannelGroupId' })
  @Expose()
  adminGroup: ChannelGroup;

  toBotAudio(): AudioQuality {
    return {
      codec: BotCodec[this.codec.code],
      quality: this.codecQuality,
    };
  }

  toBotPermissions(): ChannelPermission[] {
    return this.permissions.map(perm => ({
      permission: perm.permission.permid,
      value: perm.value,
    }));
  }
}
