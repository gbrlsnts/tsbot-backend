import { Response } from 'express';
import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  ParseIntPipe,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Res,
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
import { getExtension } from 'mime';

@Controller('/servers/:server/icons')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class IconsController {
  constructor(private iconsService: IconsService) {}

  @Get()
  getAllIcons(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Icon[]> {
    return this.iconsService.getAllIconsByServer(serverId);
  }

  @Get('/:id')
  getIconById(@Param('id', ParseUUIDPipe) id: string): Promise<Icon> {
    return this.iconsService.getIconById(id);
  }

  @Get('/:id/content')
  async getIconContentById(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.iconsService.getIconContentById(id);
    const filename = data.id + '.' + getExtension(data.icon.mime);

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': data.icon.mime,
      'Cache-Control': 'public, max-age=31536000',
    });

    res.send(data.content);
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
