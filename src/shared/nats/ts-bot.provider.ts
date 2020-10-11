import { FactoryProvider } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { TS_BOT_SERVICE } from '../constants';
import { natsOutboundOptions } from './nats.config';

export const botProvider: FactoryProvider = {
  provide: TS_BOT_SERVICE,
  useFactory: (): ClientProxy => {
    return ClientProxyFactory.create(natsOutboundOptions);
  },
};
