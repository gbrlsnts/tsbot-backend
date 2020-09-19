import { Server } from '../servers/server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serverId: number;

  @Column()
  @Index()
  address: string;

  @Column()
  tsClientDbId: number;

  @Column({
    length: 30,
  })
  tsUniqueId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Server)
  server: Server;
}
