import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Codec {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  code: string;

  @Column()
  @Expose()
  name: string;

  @OneToMany(
    () => ChannelConfig,
    config => config.codec,
  )
  channelConfigs: ChannelConfig[];
}
