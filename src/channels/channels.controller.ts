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
  @SetServerRoles([ServerRoles.OWNER, ServerRoles.CLIENT])
  @SetChannelRoles([ChannelRoles.OWNER])
  getChannelById(
    @Param('id', ParseIntPipe) id: number,
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Channel> {
    return this.channelsService.getChannelByServerId(id, serverId);
  }

  @Post()
  @SetServerRoles([ServerRoles.OWNER, ServerRoles.CLIENT])
  @SetChannelRoles([ChannelRoles.OWNER])
  createChannel(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: ChannelDto,
  ): Promise<Channel> {
    return this.channelsService.createChannel(user.id, serverId, dto);
  }

  @Delete('/:id')
  @SetServerRoles([ServerRoles.OWNER, ServerRoles.CLIENT])
  @SetChannelRoles([ChannelRoles.OWNER])
  deleteChannel(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.channelsService.deleteChannel(user.id, id);
  }
}
