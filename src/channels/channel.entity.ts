import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, Index, ManyToOne } from 'typeorm';
import { Client } from '../clients/client.entity';

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({ unique: true })
    clientId: number;

    @Column()
    tsChannelId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Client, client => client.channels)
    client: Client;
}