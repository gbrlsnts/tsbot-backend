import {
  Controller,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  SerializeOptions,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ServerRolesGuard,
  ServerRoles,
} from '../servers/guards/server-roles.guard';
import { appSerializeOptions } from '../shared/constants';
import { ServerGroupsService } from './service/server-groups.service';
import { ServerGroup } from './server-group.entity';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import { ServerGroupSyncService } from './sync/server-groups-sync.service';
import { ChannelGroupSyncService } from './sync/channel-groups-sync.service';
import { GroupFilters } from './groups.types';
import { ChannelGroupsService } from './service/channel-groups.service';
import { ChannelGroup } from './channel-group.entity';

@Controller('/servers/:server/groups')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ServerGroupsController {
  constructor(
    private serverGroupsService: ServerGroupsService,
    private channelGroupsService: ChannelGroupsService,
    private serverGroupsSyncService: ServerGroupSyncService,
    private channelGroupsSyncService: ChannelGroupSyncService,
  ) {}

  @Get('/server')
  getAllServerGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
    @Query() options: GroupFilters,
  ): Promise<ServerGroup[]> {
    return this.serverGroupsService.getAllGroupsByServerId(serverId, options);
  }

  @Get('/channel')
  getAllChannelGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
    @Query() options: GroupFilters,
  ): Promise<ChannelGroup[]> {
    return this.channelGroupsService.getAllGroupsByServerId(serverId, options);
  }

  @Put('/sync/server')
  syncServerGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<void> {
    return this.serverGroupsSyncService.syncGroupsByServerId(serverId);
  }

  @Put('/sync/channel')
  syncChannelGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<void> {
    return this.channelGroupsSyncService.syncGroupsByServerId(serverId);
  }
}
