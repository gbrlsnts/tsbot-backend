import { Body, Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CrawlerListenerService } from './crawler.service';
import {
  getAllCrawlsSubject,
  getPrevCrawlSubject,
  getAddCrawlSubject,
  getAllInactiveChannelsSubject,
  getSetInactiveChannelsSubject,
  getFindInactiveChannelByIdSubject,
  getSetInactiveChannelNotifiedSubject,
} from '../teamspeak/subjects';
import { CrawlerChannel, CrawlInfo } from '../teamspeak/types/crawl';
import { GetServerId } from '../shared/decorators/get-server-id.decorator';
import { CrawlerChannelListDto } from './dto/crawler-channel.dto';
import { SetChannelNotifiedDto } from './dto/set-notified.dto';
import { GetInactiveChannelByIdDto } from './dto/set-notified.dto copy';
import { AddCrawlDto } from './dto/add-crawl.dto';

@Controller()
export class CrawlListenerController {
  constructor(private readonly crawlService: CrawlerListenerService) {}

  @MessagePattern(getAllCrawlsSubject)
  getCrawls(@GetServerId() serverId: number): Promise<CrawlInfo[]> {
    return this.crawlService.getCrawls(serverId);
  }

  @MessagePattern(getPrevCrawlSubject)
  getPrevCrawl(
    @GetServerId() serverId: number,
  ): Promise<CrawlInfo | undefined> {
    return this.crawlService.getPrevCrawl(serverId);
  }

  @MessagePattern(getAddCrawlSubject)
  addCrawl(
    @GetServerId() serverId: number,
    @Body(ValidationPipe) dto: AddCrawlDto,
  ): Promise<void> {
    return this.crawlService.addCrawl(serverId, dto.crawl);
  }

  @MessagePattern(getAllInactiveChannelsSubject)
  getCrawlerInactiveChannels(
    @GetServerId() serverId: number,
  ): Promise<CrawlerChannel[]> {
    return this.crawlService.getCrawlerInactiveChannels(serverId);
  }

  @MessagePattern(getSetInactiveChannelsSubject)
  setCrawlerInactiveChannels(
    @GetServerId() serverId: number,
    @Body(ValidationPipe) dto: CrawlerChannelListDto,
  ): Promise<void> {
    return this.crawlService.setCrawlerInactiveChannels(
      serverId,
      dto.channelList,
    );
  }

  @MessagePattern(getFindInactiveChannelByIdSubject)
  getInactiveChannelById(
    @GetServerId() serverId: number,
    @Body(ValidationPipe) dto: GetInactiveChannelByIdDto,
  ): Promise<CrawlerChannel> {
    return this.crawlService.getInactiveChannelById(serverId, dto.channelId);
  }

  @MessagePattern(getSetInactiveChannelNotifiedSubject)
  setChannelNotified(
    @GetServerId() serverId: number,
    @Body(ValidationPipe) dto: SetChannelNotifiedDto,
  ): Promise<void> {
    return this.crawlService.setChannelNotified(
      serverId,
      dto.channelId,
      dto.notified,
    );
  }
}
