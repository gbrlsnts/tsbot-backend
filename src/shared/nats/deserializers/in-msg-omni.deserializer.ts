import { ConsumerDeserializer, IncomingRequest } from '@nestjs/microservices';
import { isUndefined } from '@nestjs/common/utils/shared.utils';

import { v4 as uuid } from 'uuid';

export class InboundMessageOmniDeserializer implements ConsumerDeserializer {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  deserialize(value: any, options?: Record<string, any>) {
    /**
     * Our omni deserializer handles either external formatted messages (which
     * can originate from our external clients, or our newly capable Nest
     * apps that use the external serializer), or from "old" Nest apps that
     * continue to issue Nest-formatted messages.
     */
    if (this.isInternal(value)) {
      return value;
    } else {
      /**
       * If the message source is external, and it's a request, we generate a
       * uniquely formatted `id` field.  We prefix these ids with the string
       * `'EXT'` so they can be recognized and the response message can be
       * properly serialized. This pairs up with the `OutboundResponseOmniSerializer` class,
       * which looks for this unique id format and serializes a response appropriate
       * for the requestor.
       */
      return {
        pattern: undefined,
        data: value,
        id: options && options.replyTo ? `EXT-${uuid()}` : undefined,
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  isInternal(value: any): boolean {
    if (
      !isUndefined((value as IncomingRequest).pattern) &&
      !isUndefined((value as IncomingRequest).data) &&
      !isUndefined((value as IncomingRequest).id)
    ) {
      return true;
    }
    return false;
  }
}
