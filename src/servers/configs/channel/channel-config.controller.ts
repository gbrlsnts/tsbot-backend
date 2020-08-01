import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Body,
  ValidationPipe,
  Post,
  Patch,
  Put,
  Delete,
} from '@nestjs/common';
import { ChannelConfigService } from './channel-config.service';
import { ChannelConfig } from './channel-config.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ServerRolesGuard } from 'src/servers/guards/server-roles.guard';
import { appSerializeOptions } from 'src/shared/constants';
import { SetServerRoles } from 'src/servers/decorators/set-server-roles.decorator';
import { ServerRoles } from '../../guards/server-roles.guard';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { ChannelConfigPermission } from './channel-perm.entity';
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
    @Param('server', ParseIntPipe) serverId: number,
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
    @Param('id', ParseIntPipe) id: number,
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
    @Body(new ValidationPipe({ groups: ['post'] })) dto: ChannelConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.createConfig(serverId, dto);
  }

  @Patch('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ groups: ['patch'] })) dto: ChannelConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.updateConfig(id, dto);
  }

  @Put('/:id/permissions')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  setConfigPermissions(
    @Param('id', ParseIntPipe) configId: number,
    @Body(ValidationPipe) dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    return this.configService.setConfigPermissions(configId, dto);
  }

  @Delete('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  deleteConfig(@Param('id', ParseIntPipe) configId: number): Promise<void> {
    return this.configService.deleteConfig(configId);
  }
}
