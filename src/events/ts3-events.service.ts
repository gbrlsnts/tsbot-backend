import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEventEmitter } from 'nest-emitter';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import { AppEventEmitter } from './types/app.event';
import { TsServerEventsService } from '../teamspeak/server-events.service';
import { ConfigCommonService } from '../teamspeak-common/config-common.service';

@Injectable()
export class Ts3EventsService implements OnModuleInit {
  constructor(
    @InjectEventEmitter() private readonly emitter: AppEventEmitter,
    private readonly tsEvents: TsServerEventsService,
    private tsConfigCommonService: ConfigCommonService,
  ) {}

  onModuleInit(): void {
    this.emitter.on(
      'zoneUpdated',
      async zone => await this.onZoneUpdated(zone),
    );
  }

  private async onZoneUpdated(zone: Zone): Promise<void> {
    const config = await this.tsConfigCommonService.getCrawlerConfiguration(
      zone.serverId,
    );

    this.tsEvents.emitCrawlConfigUpdatedEvent(zone.serverId, config);
  }
}
