import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('/servers/:server/clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('')
  getAllServerClients(@Param('server', ParseIntPipe) serverId: number): void {
    console.log(serverId);
  }

  @Get('/:id')
  getServerClientById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): void {
    console.log(serverId, id);
  }

  @Post()
  createServerClientById(
    @Param('server', ParseIntPipe) serverId: number,
  ): void {
    console.log(serverId);
  }

  @Patch('/:id')
  updateServerClient(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): void {
    console.log(serverId, id);
  }
}
