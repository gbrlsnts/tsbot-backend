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

@Entity()
export class ServerConfig {
  @PrimaryColumn()
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

  @Column('json')
  config: ServerConfigDto;

  @AfterLoad()
  initConfigDto(): void {
    this.config = new ServerConfigDto(this.config);
  }
}
