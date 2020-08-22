import {
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  ParseIntPipe,
  Get,
  Param,
  ValidationPipe,
  Body,
  Put,
} from '@nestjs/common';
import { CrawlsService } from './crawls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  appSerializeOptions,
  appValidationPipeOptions,
} from '../shared/constants';
import { IsAdminGuard } from '../auth/guards/admin.guard';
import { InactiveChannel } from './inactive-channel.entity';
import { SetInactiveChannelsDto } from './dto/set-inactive.dto';

@Controller('/servers/:server/inactive-channels')
@UseGuards(JwtAuthGuard, IsAdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class InactiveController {
  constructor(private crawlsService: CrawlsService) {}

  @Get()
  getInactiveChannels(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<InactiveChannel[]> {
    return this.crawlsService.getInactiveChannelsByServer(serverId);
  }

  @Put()
  setInactiveChannels(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(new ValidationPipe(appValidationPipeOptions))
    dto: SetInactiveChannelsDto,
  ): Promise<void> {
    return this.crawlsService.setInactiveChannelsInServer(serverId, dto);
  }
}
