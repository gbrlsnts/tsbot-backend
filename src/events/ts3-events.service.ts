import * as config from 'config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEventEmitter } from 'nest-emitter';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import { AppEventEmitter } from './types/app.event';
import { TsServerEventsService } from '../teamspeak/server-events.service';
import { ZoneService } from '../servers/configs/zone/zone.service';
import { CrawlerConfiguration } from 'src/teamspeak/types/crawl';

const crawlInterval = config.get<number>('teamspeak.crawlInterval');

@Injectable()
export class Ts3EventsService implements OnModuleInit {
  constructor(
    @InjectEventEmitter() private readonly emitter: AppEventEmitter,
    private readonly tsEvents: TsServerEventsService,
    private zoneService: ZoneService,
  ) {}

  onModuleInit(): void {
    this.emitter.on(
      'zoneUpdated',
      async zone => await this.onZoneUpdated(zone),
    );
  }

  private async onZoneUpdated(zone: Zone): Promise<void> {
    const interval = Number(process.env.CRAWL_INTERVAL || crawlInterval);
    const zones = (
      await this.zoneService.getAllZonesByServer(zone.serverId)
    ).filter(z => z.crawl);

    const data: CrawlerConfiguration = {
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

    this.tsEvents.emitCrawlConfigUpdatedEvent(zone.serverId, data);
  }
}
