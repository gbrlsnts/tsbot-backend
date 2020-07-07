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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user-decorator';
import { ServersService } from './servers.service';
import { ServersListResponse, ServerResponse, ServerConfigResponse } from './server.types';
import { CreateServerDto } from './dto/create-server.dto';
import { User } from '../users/user.entity';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private serverService: ServersService) {}

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
    const serverConfig = await this.serverService.getServerConfigById(id);

    return { config: serverConfig.config };
  }

  @Post()
  async createServer(
    @GetUser() user: User,
    @Body() dto: CreateServerDto,
  ): Promise<ServerResponse> {
    const server = await this.serverService.createServer(user, dto);

    return { server };
  }

  @Patch('/:id')
  updateServer(): void {
    return;
  }

  @Delete('/:id')
  deleteServer(
    @Param('id', ParseIntPipe) 
    id: number
  ): Promise<void> {
    return this.serverService.deleteServer(id);
  }
}
