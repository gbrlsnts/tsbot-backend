import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
} from 'typeorm';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';

@Entity()
export class Codec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @OneToMany(
    () => ChannelConfig,
    config => config.codec,
  )
  channelConfigs: ChannelConfig[];
}
