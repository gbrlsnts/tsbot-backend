import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';

@Entity()
export class Codec extends BaseEntity {
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
