import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerGroupsService } from './server-groups.service';
import { ServerGroupsController } from './server-groups.controller';
import { ServerGroupRepository } from './server-group.repository';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServerGroupRepository]), ServersModule, ClientsModule],
  providers: [ServerGroupsService],
  controllers: [ServerGroupsController]
})
export class ServerGroupsModule {}
