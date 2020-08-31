import { PrimaryGeneratedColumn, Column, OneToOne, Entity } from 'typeorm';
import { ChannelConfig } from '../channel/channel-config.entity';
import { Expose } from 'class-transformer';

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
  })
  @Expose()
  minutesInactiveNotify: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  minutesInactiveDelete: number;

  @Column()
  @Expose()
  isDefault: boolean;

  @OneToOne(
    () => ChannelConfig,
    config => config.zone,
  )
  channelConfig: ChannelConfig;
}
