import * as config from 'config';
import { Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { TsUserChannelService } from './user-channel.service';
import { TS_BOT_SERVICE } from '../shared/constants';
import { InboundResponseExternalDeserializer } from '../shared/nats/deserializers/in-response-ext.deserializer';
import { OutboundMessageExternalSerializer } from '../shared/nats/serializers/out-msg-ext.serializer';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { ServerGroupService } from './server-groups.service';
import { TsIconService } from './icons.service';
import { TsClientService } from './client.service';
import { TsServerEventsService } from './server-events.service';

const natsConfig = config.get('nats');

@Module({
  providers: [
    {
      provide: TS_BOT_SERVICE,
      useFactory: (): ClientProxy => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            url: process.env.NATS_URL || natsConfig.url,
            maxReconnectAttempts:
              process.env.NATS_MAX_RECONNECT_ATTEMPTS ||
              natsConfig.maxReconnectAttempts,
            serializer: new OutboundMessageExternalSerializer(),
            deserializer: new InboundResponseExternalDeserializer(),
          },
        });
      },
    },
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
