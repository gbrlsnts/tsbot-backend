import { PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Expose } from "class-transformer";
import { User } from '../../users/user.entity';
import { Server } from '../server.entity';

export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  userId: number;

  @Column()
  @Expose()
  serverId: number;

  @Column({
    length: 30,
  })
  @Expose()
  tsUniqueId: string;

  @Column()
  @Expose()
  tsClientDbId: number;

  @ManyToOne(() => User, user => user.clients)
  user: User;

  @ManyToOne(() => User, server => server.clients)
  server: Server;
}