import * as config from 'config';
import { FactoryProvider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { TS_BOT_SERVICE } from '../constants';
import { InboundResponseExternalDeserializer } from './deserializers/in-response-ext.deserializer';
import { OutboundMessageExternalSerializer } from './serializers/out-msg-ext.serializer';

const natsConfig = config.get('nats');

export const botProvider: FactoryProvider = {
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
};
