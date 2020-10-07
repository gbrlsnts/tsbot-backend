import * as config from 'config';
import { Module, forwardRef } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { UserChannelService } from './user-channel.service';
import { TS_BOT_SERVICE } from '../shared/constants';
import { InboundResponseExternalDeserializer } from '../shared/nats/deserializers/in-response-ext.deserializer';
import { OutboundMessageExternalSerializer } from '../shared/nats/serializers/out-msg-ext.serializer';
import { ServersModule } from '../servers/servers.module';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { ServerGroupService } from './server-groups.service';
import { TsIconService } from './icons.service';
import { TsClientService } from './client.service';
import { TsServerEventsService } from './server-events.service';

const natsConfig = config.get('nats');

@Module({
  imports: [forwardRef(() => ServersModule)],
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
    UserChannelService,
    ServerGroupService,
    TsIconService,
    TsClientService,
    TsServerEventsService,
  ],
  exports: [
    UserChannelService,
    ServerGroupService,
    TsIconService,
    TsClientService,
    TsServerEventsService,
  ],
})
export class TeamspeakModule {}
