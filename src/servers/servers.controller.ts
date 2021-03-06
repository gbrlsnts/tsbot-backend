import {
  Controller,
  UseGuards,
  Get,
  Put,
  Patch,
  Delete,
  Post,
  ParseIntPipe,
  Param,
  Body,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServerRolesGuard, ServerRoles } from './guards/server-roles.guard';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { ServersService } from './servers.service';
import { ServerDto } from './dto/server.dto';
import { User } from '../users/user.entity';
import { ServersConfigService } from './configs/server/servers-config.service';
import { atLeastOnePropertyDefined } from '../shared/messages/global.messages';
import { SetServerRoles } from './decorators/set-server-roles.decorator';
import { Server } from './server.entity';
import { ServerConfig } from './configs/server/server-config.entity';
import { appSerializeOptions } from '../shared/constants';
import { IsAdminGuard } from '../auth/guards/admin.guard';
import { UpdateServerDto } from './dto/update-server.dto';

@Controller('servers')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER], 'id')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ServersController {
  constructor(
    private serverService: ServersService,
    private configService: ServersConfigService,
  ) {}

  @Get()
  @UseGuards(IsAdminGuard)
  getServers(): Promise<Server[]> {
    return this.serverService.getServers();
  }

  @Get('/:id')
  getServerById(@Param('id', ParseIntPipe) id: number): Promise<Server> {
    return this.serverService.getServerById(id);
  }

  @Get('/:id/config')
  getServerConfigById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServerConfig> {
    return this.configService.getServerConfigById(id);
  }

  @Put('/:id/config/clear-error')
  async clearConnectionError(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.configService.setConnectionErrorFlag(id, false);
  }

  @Post()
  createServer(@GetUser() user: User, @Body() dto: ServerDto): Promise<Server> {
    return this.serverService.createServer(user, dto);
  }

  @Patch('/:id')
  updateServer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServerDto,
  ): Promise<Server> {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException(atLeastOnePropertyDefined);

    return this.serverService.updateServer(id, dto);
  }

  @Delete('/:id')
  deleteServer(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    return this.serverService.deleteServer(id);
  }
}
