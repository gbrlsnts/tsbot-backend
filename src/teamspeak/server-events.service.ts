import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { crawlConfigUpdatedEventSubject } from './subjects';
import { ZoneService } from '../servers/configs/zone/zone.service';
import { CrawlerConfiguration } from './types/crawl';

@Injectable()
export class TsServerEventsService {
  constructor(
    private busService: TeamspeakBusService,
    private zoneService: ZoneService,
  ) {}

  /**
   * Emit an event with the updated zone
   * @param zone zone that was updated
   */
  async emitCrawlConfigUpdatedEvent(
    serverId: number,
    data: CrawlerConfiguration,
  ): Promise<void> {
    this.busService.emit(crawlConfigUpdatedEventSubject(serverId), data);
  }
}
