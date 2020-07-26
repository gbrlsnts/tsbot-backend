import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ServerConfig } from './configs/server/server-config.entity';
import { Expose } from 'class-transformer';
import { serializationGroups } from '../shared/types';
import { Client } from '../clients/client.entity';
import { ChannelConfig } from './configs/channel/channel-config.entity';

@Entity()
export class Server {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  ownerId: number;

  @OneToOne(
    () => ServerConfig,
    config => config.server,
  )
  config: ServerConfig;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn()
  @Expose({
    groups: [serializationGroups.APP_ADMIN],
  })
  deletedAt: Date;

  @ManyToOne(
    () => User,
    user => user.servers,
  )
  owner: User;

  @OneToMany(
    () => Client,
    client => client.server,
  )
  clients: Client[];

  @OneToMany(() => ChannelConfig, config => config.server)
  channelConfigs: ChannelConfig[];
}
