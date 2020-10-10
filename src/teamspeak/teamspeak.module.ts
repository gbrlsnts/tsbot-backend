import { Module } from '@nestjs/common';
import { botProvider } from '../shared/nats/ts-bot.provider';
import { TsUserChannelService } from './user-channel.service';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { ServerGroupService } from './server-groups.service';
import { TsIconService } from './icons.service';
import { TsClientService } from './client.service';
import { TsServerEventsService } from './server-events.service';

@Module({
  providers: [
    botProvider,
    TeamspeakBusService,
    TsUserChannelService,
    ServerGroupService,
    TsIconService,
    TsClientService,
    TsServerEventsService,
  ],
  exports: [
    TsUserChannelService,
    ServerGroupService,
    TsIconService,
    TsClientService,
    TsServerEventsService,
  ],
})
export class TeamspeakModule {}
