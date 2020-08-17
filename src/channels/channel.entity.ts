import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Index({ unique: true })
  @Expose()
  clientId: number;

  @Column()
  @Expose()
  tsChannelId: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @ManyToOne(
    () => Client,
    client => client.channels,
  )
  client: Client;
}
