import { Controller, Get, Param, ParseIntPipe, UseGuards, UseInterceptors, SerializeOptions, ClassSerializerInterceptor, Body, ValidationPipe, Post } from '@nestjs/common';
import { ChannelConfigService } from './channel-config.service';
import { ChannelConfig } from './channel-config.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ServerRolesGuard } from 'src/servers/guards/server-roles.guard';
import { appSerializeOptions } from 'src/shared/constants';
import { SetServerRoles } from 'src/servers/decorators/set-server-roles.decorator';
import { ServerRoles } from '../../guards/server-roles.guard';
import { ChannelConfigDto } from './dto/channel-config.dto';

@Controller('/servers/:server/configs/channels')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ChannelConfigController {
  constructor(private configService: ChannelConfigService) {}

  @Get()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getConfigsByServer(
    @Param('server', ParseIntPipe) serverId: number
  ): Promise<ChannelConfig[]> {
    return this.configService.getConfigsByServerId(serverId);
  }

  @Get('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getConfigById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<ChannelConfig> {
    return this.configService.getServerConfigById(serverId, id);
  }

  @Post()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  createConfig(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(ValidationPipe) dto: ChannelConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.createConfig(serverId, dto);
  }
}