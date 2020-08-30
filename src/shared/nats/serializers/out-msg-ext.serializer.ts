import { Serializer, OutgoingResponse } from '@nestjs/microservices';

export class OutboundMessageExternalSerializer implements Serializer {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  serialize(value: any): OutgoingResponse {
    /**
     * Here, we are merely "unpacking" the data payload from the Nest
     * message structure, and returning it as a "plain" top-level object.
     */

    return value.data;
  }
}
