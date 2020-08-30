import { v4 as uuid } from 'uuid';
import { ConsumerDeserializer } from '@nestjs/microservices';

export class InboundMessageExternalDeserializer
  implements ConsumerDeserializer {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unused-vars
  deserialize(value: any, options?: Record<string, any>) {
    /**
     * Here, we merely wrap our inbound message payload in the standard Nest
     * message structure.
     */
    return {
      pattern: undefined,
      data: value,
      id: uuid(),
    };
  }
}
