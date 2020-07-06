import { Entity, OneToOne, Column, PrimaryColumn } from "typeorm";
import { Server } from './server.entity';
import { ServerConfigInterface } from './server.types';

@Entity()
export class ServerConfig {
    @OneToOne(() => Server, server => server.config, {
        primary: true
    })
    server: Server;

    @Column('json')
    config: ServerConfigInterface;
}