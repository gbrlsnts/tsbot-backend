import { Serializer, OutgoingResponse } from '@nestjs/microservices';

export class OutboundResponseOmniSerializer implements Serializer {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  serialize(value: any): OutgoingResponse {
    if (value && value.id && /EXT-/.test(value.id)) {
      return value.response;
    } else {
      return value;
    }
  }
}
