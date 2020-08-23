import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  ParseIntPipe,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { IconsService } from './icons.service';
import { Icon } from './icon.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { appSerializeOptions } from '../shared/constants';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import {
  ServerRoles,
  ServerRolesGuard,
} from '../servers/guards/server-roles.guard';
import { UploadIconDto } from './dto/upload-icon.dto';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';

@Controller('/servers/:server/icons')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class ServerIconsController {
  constructor(private iconsService: IconsService) {}

  @Get()
  getAllIcons(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Icon[]> {
    return this.iconsService.getAllIconsByServer(serverId);
  }

  @Post()
  @SetServerRoles([ServerRoles.OWNER])
  uploadIcon(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: UploadIconDto,
  ): Promise<Icon> {
    return this.iconsService.uploadIcon(user.id, serverId, dto);
  }
}
