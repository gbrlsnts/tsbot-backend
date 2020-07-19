import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Client } from './client.entity';

@Entity()
export class ClientHistory {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  clientId: number;

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

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @ManyToOne(
    () => Client,
    client => client.history,
    {
      primary: true,
      onDelete: 'CASCADE',
    },
  )
  client: Client;

  /**
   * Initialize this dto with data
   * @param init properties to initialize the dto with
   */
  constructor(init?: Partial<ClientHistory>) {
    Object.assign(this, init);
  }

  /**
   * Initialize a new ClientHistory from a Client
   * @param client client to copy properties from
   * @returns the initialized ClientHistory object
   */
  static fromClient(client: Client): ClientHistory {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, ...copy } = client;

    return new ClientHistory(copy);
  }
}
