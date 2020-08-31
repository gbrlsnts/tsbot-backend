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
import { Codec } from '../../../metadata/codec.entity';
import { Zone } from '../zone/zone.entity';
import { Server } from '../../server.entity';
import { ChannelConfigPermission } from './channel-perm.entity';
import { Expose } from 'class-transformer';
import {
  AudioQuality,
  BotCodec,
  ChannelPermission,
} from 'src/teamspeak/types/channel';

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
    nullable: true,
  })
  @Expose()
  zoneId?: number;

  @Column({
    nullable: true,
    unsigned: true,
  })
  @Expose()
  allowedSubChannels: number;

  @Column({
    nullable: true,
  })
  codecId: number;

  @Column({
    nullable: true,
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
    { eager: true },
  )
  @Expose()
  permissions: ChannelConfigPermission[];

  @ManyToOne(
    () => Codec,
    codec => codec.channelConfigs,
    { eager: true },
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
  @Expose()
  zone: Zone;

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
