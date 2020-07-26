import { PrimaryGeneratedColumn, Column, OneToOne, Entity } from 'typeorm';
import { ChannelConfig } from '../../channel/channel-config.entity';

@Entity()
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unsigned: true,
  })
  channelIdStart: number;

  @Column({
    unsigned: true,
  })
  channelIdEnd: number;

  @Column({
    default: false,
  })
  separator: boolean;

  @Column({
    unsigned: true,
  })
  secondsInactiveNotify: number;

  @Column({
    unsigned: true,
  })
  secondsInactiveMax: number;

  @OneToOne(
    () => ChannelConfig,
    config => config.zone,
  )
  channelConfig: ChannelConfig;
}
