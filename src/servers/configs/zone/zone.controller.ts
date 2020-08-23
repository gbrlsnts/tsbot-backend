import {
  Controller,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Param,
  Get,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ServerRolesGuard } from 'src/servers/guards/server-roles.guard';
import { appSerializeOptions } from 'src/shared/constants';
import { ZoneService } from './zone.service';
import { Zone } from './zone.entity';
import { SetServerRoles } from '../../decorators/set-server-roles.decorator';
import { ServerRoles } from '../../guards/server-roles.guard';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateZoneDto } from './dto/create-zone.dto';

@Controller('/servers/:server/configs/zones')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ZoneController {
  constructor(private zoneService: ZoneService) {}

  @Get()
  @SetServerRoles([ServerRoles.OWNER])
  getZonesByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Zone[]> {
    return this.zoneService.getAllZonesByServer(serverId);
  }

  @Get('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  getZoneById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Zone> {
    return this.zoneService.getZoneIdByServer(id, serverId);
  }

  @Post()
  @SetServerRoles([ServerRoles.OWNER])
  createZone(
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: CreateZoneDto,
  ): Promise<Zone> {
    return this.zoneService.createZone(serverId, dto);
  }

  @Patch('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  updateZone(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZoneDto,
  ): Promise<Zone> {
    return this.zoneService.updateZone(id, dto);
  }

  @Delete('/:id')
  @SetServerRoles([ServerRoles.OWNER])
  deleteZone(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.zoneService.deleteZone(id);
  }
}
