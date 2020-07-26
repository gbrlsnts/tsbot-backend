import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  HttpCode,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';
import { SaveClientDto } from './dto/save-client.dto';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { appSerializeOptions } from '../shared/constants';
import {
  ServerRolesGuard,
  ServerRoles,
} from '../servers/guards/server-roles.guard';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';

@Controller('/servers/:server/clients')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getAllServerClients(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Client[]> {
    return this.clientsService.getAllClientsByServerId(serverId);
  }

  @Get('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getServerClientById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) clientId: number,
  ): Promise<Client> {
    return this.clientsService.getServerClientById(serverId, clientId);
  }

  @Post()
  @HttpCode(200)
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  saveServerClientById(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body(ValidationPipe) dto: SaveClientDto,
  ): Promise<Client> {
    return this.clientsService.saveClient(user.id, serverId, dto);
  }
}
