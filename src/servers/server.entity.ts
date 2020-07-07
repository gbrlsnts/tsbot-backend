import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ServerConfig } from './server-config.entity';

@Entity()
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  ownerId: number;

  @OneToOne(
    () => ServerConfig,
    config => config.server,
  )
  config: ServerConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(
    () => User,
    user => user.servers,
  )
  owner: User;
}
