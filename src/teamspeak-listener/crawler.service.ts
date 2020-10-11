import { Injectable } from '@nestjs/common';
import { CrawlZone } from 'src/crawls/crawl-zone.entity';
import {
  CrawlInfo,
  CrawlerChannel,
  CrawlZoneInfo,
} from '../teamspeak/types/crawl';
import { CrawlsService } from '../crawls/crawls.service';
import { CrawlDto } from '../crawls/dto/crawl.dto';

@Injectable()
export class CrawlerListenerService {
  constructor(private readonly crawlsService: CrawlsService) {}

  async getCrawls(serverId: number): Promise<CrawlInfo[]> {
    const crawls = await this.crawlsService.getCrawlsByServerId(serverId);

    return crawls.map(c => ({
      runAt: c.runAt,
      zones: this.mapCrawlZones(c.zones),
    }));
  }

  async getPrevCrawl(serverId: number): Promise<CrawlInfo | undefined> {
    try {
      const crawl = await this.crawlsService.getLastCrawl(serverId);

      return {
        runAt: crawl.runAt,
        zones: this.mapCrawlZones(crawl.zones),
      };
    } catch (e) {
      return;
    }
  }

  async addCrawl(serverId: number, crawl: CrawlDto): Promise<void> {
    await this.crawlsService.storeCrawl(serverId, crawl);
  }

  async getCrawlerInactiveChannels(
    serverId: number,
  ): Promise<CrawlerChannel[]> {
    const channels = await this.crawlsService.getInactiveChannelsByServer(
      serverId,
    );

    return channels.map(c => ({
      channelId: c.tsChannelId,
      timeInactive: c.timeInactive,
      isNotified: c.isNotified,
      lastUpdated: c.updatedAt,
    }));
  }

  setCrawlerInactiveChannels(
    serverId: number,
    channelList: CrawlerChannel[],
  ): Promise<void> {
    const channels = channelList.map(c => ({
      tsChannelId: c.channelId,
      timeInactive: c.timeInactive,
      isNotified: c.isNotified,
      updatedAt: c.lastUpdated,
    }));

    return this.crawlsService.setInactiveChannelsInServer(serverId, {
      channels,
    });
  }

  async getInactiveChannelById(
    serverId: number,
    channelId: number,
  ): Promise<CrawlerChannel> {
    const channel = await this.crawlsService.getInactiveChannelById(
      serverId,
      channelId,
    );

    return {
      channelId: channel.tsChannelId,
      timeInactive: channel.timeInactive,
      isNotified: channel.isNotified,
      lastUpdated: channel.updatedAt,
    };
  }

  setChannelNotified(
    serverId: number,
    channelId: number,
    notified: boolean,
  ): Promise<void> {
    return this.crawlsService.setChannelNotified(serverId, channelId, notified);
  }

  private mapCrawlZones(zones: CrawlZone[]): CrawlZoneInfo[] {
    return zones.map(z => ({
      zone: z.zone.friendlyId(),
      inactiveChannels: z.inactiveChannels,
      deletedChannels: z.deletedChannels,
      totalChannels: z.totalChannels,
    }));
  }
}
