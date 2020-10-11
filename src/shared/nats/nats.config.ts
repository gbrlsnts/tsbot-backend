import * as config from 'config';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { InboundResponseExternalDeserializer } from './deserializers/in-response-ext.deserializer';
import { OutboundMessageExternalSerializer } from './serializers/out-msg-ext.serializer';
import { InboundMessageExternalDeserializer } from './deserializers/in-msg-ext.deserializer';
import { OutboundResponseExternalSerializer } from './serializers/out-response-ext.serializer';

const natsConfig = config.get('nats');

export const natsOutboundOptions: NatsOptions = {
  transport: Transport.NATS,
  options: {
    url: process.env.NATS_URL || natsConfig.url,
    maxReconnectAttempts:
      process.env.NATS_MAX_RECONNECT_ATTEMPTS ||
      natsConfig.maxReconnectAttempts,
    serializer: new OutboundMessageExternalSerializer(),
    deserializer: new InboundResponseExternalDeserializer(),
  },
};

export const natsInboundOptions: NatsOptions = {
  transport: Transport.NATS,
  options: {
    url: process.env.NATS_URL || natsConfig.url,
    maxReconnectAttempts:
      process.env.NATS_MAX_RECONNECT_ATTEMPTS ||
      natsConfig.maxReconnectAttempts,
    serializer: new OutboundResponseExternalSerializer(),
    deserializer: new InboundMessageExternalDeserializer(),
  },
};
