import * as config from 'config';
import { Injectable } from '@nestjs/common';
import { CrawlerConfiguration } from 'src/teamspeak/types/crawl';
import { ZoneService } from '../servers/configs/zone/zone.service';

const crawlInterval = config.get<number>('teamspeak.crawlInterval');

@Injectable()
export class ConfigCommonService {
  constructor(private zoneService: ZoneService) {}

  /**
   * Gets the crawler config for a server
   * @param serverId
   */
  async getCrawlerConfiguration(
    serverId: number,
  ): Promise<CrawlerConfiguration> {
    const interval = Number(process.env.CRAWL_INTERVAL || crawlInterval);

    const zones = (await this.zoneService.getAllZonesByServer(serverId)).filter(
      z => z.crawl,
    );

    return {
      interval,
      zones: zones.map(z => ({
        name: z.slug() + '#' + z.id,
        spacerAsSeparator: z.separator,
        start: z.channelIdStart,
        end: z.channelIdEnd,
        timeInactiveNotify: z.minutesInactiveNotify * 60,
        timeInactiveMax: z.minutesInactiveDelete * 60,
      })),
    };
  }
}
