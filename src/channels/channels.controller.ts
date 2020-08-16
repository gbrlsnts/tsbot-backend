import { Controller, Get, UseGuards, UseInterceptors, ClassSerializerInterceptor, SerializeOptions, Param, ParseIntPipe, ValidationPipe, Body, Post, Delete } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './channel.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServerRolesGuard, ServerRoles } from '../servers/guards/server-roles.guard';
import { appSerializeOptions, appValidationPipeOptions } from '../shared/constants';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import { ChannelDto } from './dto/channel.dto';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';

@Controller('/servers/:server/channels')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getChannelsByServer(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Channel[]> {
    return this.channelsService.getChannelsByServerId(serverId);
  }

  @Get('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER, ServerRoles.CLIENT],
  })
  getChannelById(
    @Param('id', ParseIntPipe) id: number,
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Channel> {
    return this.channelsService.getChannelByServerId(id, serverId);
  }

  @Post()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER, ServerRoles.CLIENT],
  })
  createChannel(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: ChannelDto
  ): Promise<Channel> {
    return this.channelsService.createChannel(user.id, serverId, dto);
  }

  @Delete('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER, ServerRoles.CLIENT],
  })
  deleteChannel(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.channelsService.deleteChannel(user.id, id);
  }
}
