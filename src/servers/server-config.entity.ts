import {
  Entity,
  OneToOne,
  Column,
  PrimaryColumn,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { Server } from './server.entity';
import { ServerConfigDto } from './dto/config.dto';
import { Expose } from 'class-transformer';

@Entity()
export class ServerConfig {
  @PrimaryColumn()
  @Expose()
  id: number;

  @OneToOne(
    () => Server,
    server => server.config,
    {
      primary: true,
    },
  )
  @JoinColumn({ name: 'id' })
  server: Server;

  @Column('jsonb')
  @Expose()
  config: ServerConfigDto;

  @AfterLoad()
  initConfigDto(): void {
    this.config = new ServerConfigDto(this.config);
  }
}
