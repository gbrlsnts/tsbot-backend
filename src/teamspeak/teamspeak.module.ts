import { Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { UserChannelService } from './user-channel.service';
import { TS_BOT_SERVICE } from '../shared/constants';
import { InboundResponseExternalDeserializer } from '../shared/nats/deserializers/in-response-ext.deserializer';
import { OutboundMessageExternalSerializer } from '../shared/nats/serializers/out-msg-ext.serializer';

@Module({
  providers: [
    {
      provide: TS_BOT_SERVICE,
      useFactory: (): ClientProxy => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            url: 'nats://home.local:4222',
            serializer: new OutboundMessageExternalSerializer(),
            deserializer: new InboundResponseExternalDeserializer(),
          },
        });
      },
    },
    UserChannelService,
  ],
  exports: [UserChannelService],
})
export class TeamspeakModule {}
