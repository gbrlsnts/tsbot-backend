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
  ValidationPipe,
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
import { ZoneDto } from './dto/zone.dto';

@Controller('/servers/:server/configs/zones')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ZoneController {
  constructor(private zoneService: ZoneService) {}

  @Get()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getZonesByServerId(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Zone[]> {
    return this.zoneService.getAllZonesByServer(serverId);
  }

  @Get('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getZoneById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Zone> {
    return this.zoneService.getZoneIdByServer(id, serverId);
  }

  @Post()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  createZone(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(ValidationPipe) dto: ZoneDto,
  ): Promise<Zone> {
    return this.zoneService.createZone(serverId, dto);
  }

  @Patch('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  updateZone(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({
      groups: ['patch']
    })) dto: ZoneDto,
  ): Promise<Zone> {
    return this.zoneService.updateZone(id, dto);
  }

  @Delete('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  deleteZone(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.zoneService.deleteZone(id);
  }
}
