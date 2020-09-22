import { Expose } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Entity,
  ManyToOne,
  Index,
} from 'typeorm';
import { ChannelConfig } from '../channel/channel-config.entity';
import { Zone as BotZone } from '../../../teamspeak/types/user-channel';
import { ServerGroup } from '../../../server-groups/server-group.entity';

export type ZoneRelations = 'channelConfig' | 'group';

@Entity()
@Index('uniq_zones_group', {
  synchronize: false,
})
export class Zone {
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
  groupId: number;

  @Column({
    length: 100,
  })
  @Expose()
  name: string;

  @Column({
    unsigned: true,
  })
  @Expose()
  channelIdStart: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  channelIdEnd: number;

  @Column({
    default: false,
  })
  @Expose()
  separator: boolean;

  @Column({
    unsigned: true,
    nullable: true,
  })
  @Expose()
  minutesInactiveNotify: number;

  @Column({
    unsigned: true,
    nullable: true,
  })
  @Expose()
  minutesInactiveDelete: number;

  @Column({ default: false })
  @Expose()
  crawl: boolean;

  @Column({ default: true })
  @Expose()
  active: boolean;

  @OneToOne(
    () => ChannelConfig,
    config => config.zone,
  )
  channelConfig: ChannelConfig;

  @ManyToOne(() => ServerGroup)
  group: ServerGroup;

  toBotData(): BotZone {
    return {
      start: this.channelIdStart,
      end: this.channelIdEnd,
      separators: this.separator,
    };
  }
}
