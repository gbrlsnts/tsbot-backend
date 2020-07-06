import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServerRepository } from './server.repository';
import { ServerConfigRepository } from './server-config.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    ServerRepository,
    ServerConfigRepository,
  ])],
  providers: [ServersService],
  controllers: [ServersController]
})
export class ServersModule {}
