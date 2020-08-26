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
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('/servers/:server/configs/channels')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ChannelConfigController {
  constructor(private configService: ChannelConfigService) {}

  @Get()
  getConfigsByServer(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<ChannelConfig[]> {
    return this.configService.getConfigsByServerId(serverId);
  }

  @Get('/:id')
  getConfigById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChannelConfig> {
    return this.configService.getServerConfigById(serverId, id);
  }

  @Post()
  createConfig(
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: CreateConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.createConfig(serverId, dto);
  }

  @Patch('/:id')
  updateConfig(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.updateConfig(serverId, id, dto);
  }

  @Put('/:id/permissions')
  setConfigPermissions(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) configId: number,
    @Body() dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    return this.configService.setConfigPermissions(serverId, configId, dto);
  }

  @Delete('/:id')
  deleteConfig(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) configId: number,
  ): Promise<void> {
    return this.configService.deleteConfig(serverId, configId);
  }
}
