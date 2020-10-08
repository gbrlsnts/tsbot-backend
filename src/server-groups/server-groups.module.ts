import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerGroupsService } from './service/server-groups.service';
import { ServerGroupsController } from './server-groups.controller';
import { ServerGroupRepository } from './repository/server-group.repository';
import { ServersModule } from '../servers/servers.module';
import { ClientsModule } from '../clients/clients.module';
import { TeamspeakModule } from '../teamspeak/teamspeak.module';
import { IconsModule } from '../icons/icons.module';
import { ServerGroupSyncService } from './sync/server-groups-sync.service';
import { ChannelGroupRepository } from './repository/channel-group.repository';
import { ChannelGroupsService } from './service/channel-groups.service';
import { ChannelGroupSyncService } from './sync/channel-groups-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerGroupRepository, ChannelGroupRepository]),
    forwardRef(() => ServersModule),
    ClientsModule,
    TeamspeakModule,
    IconsModule,
  ],
  providers: [
    ServerGroupsService,
    ServerGroupSyncService,
    ChannelGroupsService,
    ChannelGroupSyncService,
  ],
  controllers: [ServerGroupsController],
  exports: [ServerGroupsService, ChannelGroupsService],
})
export class ServerGroupsModule {}
