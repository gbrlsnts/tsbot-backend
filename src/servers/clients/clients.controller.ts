import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';
import { SaveClientDto } from './dto/save-client.dto';
import { GetUser } from '../../auth/decorators/get-user-decorator';
import { User } from '../../users/user.entity';

@Controller('/servers/:server/clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  getAllServerClients(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Client[]> {
    return this.clientsService.getAllClientsByServerId(serverId);
  }

  @Get('/:id')
  getServerClientById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) clientId: number,
  ): Promise<Client> {
    return this.clientsService.getServerClientById(serverId, clientId);
  }

  @Post()
  createServerClientById(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body(ValidationPipe) dto: SaveClientDto,
  ): Promise<Client> {
    return this.clientsService.saveClient(user.id, serverId, dto);
  }
}
