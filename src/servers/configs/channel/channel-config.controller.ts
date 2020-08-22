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
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { appValidationPipeOptions } from '../../../shared/constants';

@Controller('/servers/:server/configs/channels')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ChannelConfigController {
  constructor(private configService: ChannelConfigService) {}

  @Get()
  @SetServerRoles([ServerRoles.OWNER])
  getConfigsByServer(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<ChannelConfig[]> {
    return this.configService.getConfigsByServerId(serverId);
  }

  @Get('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  getConfigById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChannelConfig> {
    return this.configService.getServerConfigById(serverId, id);
  }

  @Post()
  @SetServerRoles([ServerRoles.OWNER])
  createConfig(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: CreateConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.createConfig(serverId, dto);
  }

  @Patch('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: UpdateConfigDto,
  ): Promise<ChannelConfig> {
    return this.configService.updateConfig(id, dto);
  }

  @Put('/:id/permissions')
  @SetServerRoles([ServerRoles.OWNER])
  setConfigPermissions(
    @Param('id', ParseIntPipe) configId: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    return this.configService.setConfigPermissions(configId, dto);
  }

  @Delete('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  deleteConfig(@Param('id', ParseIntPipe) configId: number): Promise<void> {
    return this.configService.deleteConfig(configId);
  }
}
