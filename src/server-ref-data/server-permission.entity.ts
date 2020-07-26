import { Column, PrimaryGeneratedColumn, Entity, BaseEntity, ManyToMany } from "typeorm";
import { ChannelConfig } from '../servers/channel/channel-config.entity';

@Entity()
export class ServerPermission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permid: string;

  @ManyToMany(() => ChannelConfig, config => config.permissions)
  channelConfigs: ChannelConfig[];
}