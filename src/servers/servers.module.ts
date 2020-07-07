import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServerRepository } from './server.repository';
import { ServerConfigRepository } from './server-config.repository';
import { ServersConfigService } from './servers-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerRepository, ServerConfigRepository]),
  ],
  providers: [ServersService, ServersConfigService],
  controllers: [ServersController],
})
export class ServersModule {}
