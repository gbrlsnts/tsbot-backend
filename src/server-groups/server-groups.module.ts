import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerGroupsService } from './server-groups.service';
import { ServerGroupsController } from './server-groups.controller';
import { ServerGroupRepository } from './server-group.repository';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { IconsModule } from '../icons/icons.module';
import { ServerGroupSyncService } from './groups-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerGroupRepository]),
    forwardRef(() => ServersModule),
    ClientsModule,
    TeamspeakModule,
    IconsModule,
  ],
  providers: [ServerGroupsService, ServerGroupSyncService],
  controllers: [ServerGroupsController],
  exports: [ServerGroupsService],
})
export class ServerGroupsModule {}
