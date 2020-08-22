import {
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  ParseIntPipe,
  Get,
  Param,
  Post,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { CrawlsService } from './crawls.service';
import { Crawl } from './crawl.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  appSerializeOptions,
  appValidationPipeOptions,
} from '../shared/constants';
import { IsAdminGuard } from '../auth/guards/admin.guard';
import { CrawlDto } from './dto/crawl.dto';

@Controller('/servers/:server/crawls')
@UseGuards(JwtAuthGuard, IsAdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class CrawlsController {
  constructor(private crawlsService: CrawlsService) {}

  @Get('/last')
  getLastCrawl(
    @Param('server', ParseIntPipe) serverId: number,
  ): Promise<Crawl> {
    return this.crawlsService.getLastCrawl(serverId);
  }

  @Post()
  storeCrawl(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: CrawlDto,
  ): Promise<Crawl> {
    return this.crawlsService.storeCrawl(serverId, dto);
  }
}
