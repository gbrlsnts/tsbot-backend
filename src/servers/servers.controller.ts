import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Delete,
  Post,
  ParseIntPipe,
  Param,
  Body,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user-decorator';
import { ServersService } from './servers.service';
import {
  ServersListResponse,
  ServerResponse,
  ServerConfigResponse,
} from './server.types';
import { ServerDto } from './dto/server.dto';
import { User } from '../users/user.entity';
import { ServersConfigService } from './servers-config.service';
import { atLeastOnePropertyDefined } from '../messages/global.messages';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(
    private serverService: ServersService,
    private configService: ServersConfigService,
  ) {}

  @Get()
  async getServers(): Promise<ServersListResponse> {
    const servers = await this.serverService.getServers();

    return { servers };
  }

  @Get('/:id')
  async getServerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServerResponse> {
    const server = await this.serverService.getServerById(id);

    return { server };
  }

  @Get('/:id/config')
  async getServerConfigById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServerConfigResponse> {
    const serverConfig = await this.configService.getServerConfigById(id);

    return { config: serverConfig.config };
  }

  @Post()
  async createServer(
    @GetUser() user: User,
    @Body(ValidationPipe) dto: ServerDto,
  ): Promise<ServerResponse> {
    const server = await this.serverService.createServer(user, dto);

    return { server };
  }

  @Patch('/:id')
  async updateServer(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        skipMissingProperties: true,
      }),
    )
    dto: ServerDto,
  ): Promise<ServerResponse> {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException(atLeastOnePropertyDefined);

    const server = await this.serverService.updateServer(user, id, dto);

    return { server };
  }

  @Delete('/:id')
  deleteServer(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    return this.serverService.deleteServer(id);
  }
}
