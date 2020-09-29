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
import { ServerGroupsService } from './server-groups.service';
import { ServerGroup } from './server-group.entity';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import { ServerGroupSyncService } from './groups-sync.service';
import { GroupFilters } from './groups.types';

@Controller('/servers/:server/groups')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ServerGroupsController {
  constructor(
    private groupsService: ServerGroupsService,
    private syncService: ServerGroupSyncService,
  ) {}

  @Get()
  getAllGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
    @Query() options: GroupFilters,
  ): Promise<ServerGroup[]> {
    return this.groupsService.getAllGroupsByServerId(serverId, options);
  }

  @Put('/sync')
  syncGroupsByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<void> {
    return this.syncService.syncGroupsByServerId(serverId);
  }
}
