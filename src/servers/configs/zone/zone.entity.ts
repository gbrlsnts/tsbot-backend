import slugify from 'slugify';
import { Expose } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Entity,
  ManyToOne,
  Index,
  DeleteDateColumn,
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

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToOne(
    () => ChannelConfig,
    config => config.zone,
  )
  channelConfig: ChannelConfig;

  @ManyToOne(() => ServerGroup)
  group: ServerGroup;

  @Expose()
  active(): boolean {
    return !(this.deletedAt !== undefined && this.deletedAt !== null);
  }

  slug(): string {
    return slugify(this.name);
  }

  toBotData(): BotZone {
    return {
      start: this.channelIdStart,
      end: this.channelIdEnd,
      separators: this.separator,
    };
  }
}
