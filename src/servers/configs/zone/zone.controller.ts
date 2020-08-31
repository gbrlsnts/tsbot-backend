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
@SetServerRoles([ServerRoles.OWNER])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ZoneController {
  constructor(private zoneService: ZoneService) {}

  @Get()
  getZonesByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Zone[]> {
    return this.zoneService.getAllZonesByServer(serverId);
  }

  @Get('/:id')
  getZoneById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Zone> {
    return this.zoneService.getZone({ id, serverId });
  }

  @Post()
  createZone(
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: CreateZoneDto,
  ): Promise<Zone> {
    return this.zoneService.createZone(serverId, dto);
  }

  @Patch('/:id')
  updateZone(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZoneDto,
  ): Promise<Zone> {
    return this.zoneService.updateZone(id, dto);
  }

  @Delete('/:id')
  deleteZone(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.zoneService.deleteZone(id);
  }
}
