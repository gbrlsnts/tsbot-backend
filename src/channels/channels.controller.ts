import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Param,
  ParseIntPipe,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './channel.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ServerRolesGuard,
  ServerRoles,
} from '../servers/guards/server-roles.guard';
import { appSerializeOptions } from '../shared/constants';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import { ChannelDto } from './dto/channel.dto';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';
import { SetChannelRoles } from './decorators/set-channel-roles.decorator';
import { ChannelRoles, ChannelRolesGuard } from './guard/channel-roles.guard';

@Controller('/servers/:server/channels')
@UseGuards(JwtAuthGuard, ServerRolesGuard, ChannelRolesGuard)
@SetServerRoles([ServerRoles.OWNER, ServerRoles.CLIENT])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  @SetServerRoles([ServerRoles.OWNER])
  getChannelsByServer(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Channel[]> {
    return this.channelsService.getChannelsByServerId(serverId);
  }

  @Get('/:id')
  @SetChannelRoles([ChannelRoles.OWNER], 'id')
  getChannelById(
    @Param('id', ParseIntPipe) id: number,
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Channel> {
    return this.channelsService.getChannelByServerId(id, serverId);
  }

  @Post()
  createChannel(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: ChannelDto,
  ): Promise<Channel> {
    return this.channelsService.createChannel(user.id, serverId, dto);
  }

  @Delete('/:id')
  @SetChannelRoles([ChannelRoles.OWNER], 'id')
  deleteChannel(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.channelsService.deleteChannel(user.id, serverId, id);
  }

  @Delete('/:id/sub/:sub')
  @SetChannelRoles([ChannelRoles.OWNER], 'id')
  deleteSubChannel(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('sub', ParseIntPipe) subChannelId: number,
  ): Promise<void> {
    return this.channelsService.deleteChannel(
      user.id,
      serverId,
      id,
      subChannelId,
    );
  }
}
