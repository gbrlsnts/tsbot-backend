import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { crawlConfigUpdatedEventSubject } from './subjects';
import { CrawlerConfiguration } from './types/crawl';

@Injectable()
export class TsServerEventsService {
  constructor(private busService: TeamspeakBusService) {}

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
