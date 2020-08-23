import { Response } from 'express';
import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { IconsService } from './icons.service';
import { Icon } from './icon.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { appSerializeOptions } from '../shared/constants';
import { getExtension } from 'mime';

@Controller('/icons')
export class IconsController {
  constructor(private iconsService: IconsService) {}

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions(appSerializeOptions)
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
}
