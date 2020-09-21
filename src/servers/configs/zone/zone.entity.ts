import { Expose } from 'class-transformer';
import { PrimaryGeneratedColumn, Column, OneToOne, Entity } from 'typeorm';
import { ChannelConfig } from '../channel/channel-config.entity';
import { Zone as BotZone } from '../../../teamspeak/types/user-channel';

@Entity()
export class Zone {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  serverId: number;

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
  isDefault: boolean;

  @Column({ default: false })
  @Expose()
  crawl: boolean;

  @OneToOne(
    () => ChannelConfig,
    config => config.zone,
  )
  channelConfig: ChannelConfig;

  toBotData(): BotZone {
    return {
      start: this.channelIdStart,
      end: this.channelIdEnd,
      separators: this.separator,
    };
  }
}
