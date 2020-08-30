import { WritePacket, Deserializer } from '@nestjs/microservices';

export class InboundResponseExternalDeserializer implements Deserializer {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  deserialize(value: any): WritePacket {
    /**
     * Here, we wrap the external payload received in a standard Nest
     * response message.  Note that we have omitted the `id` field, as it
     * does not have any meaning from an external responder.  Because of this,
     * we have to also:
     *   1) implement the `Deserializer` interface instead of the
     *      `ProducerDeserializer` interface used in the identity deserializer
     *   2) return an object with the `WritePacket` interface, rather than
     *      the`IncomingResponse` interface used in the identity deserializer.
     */
    return {
      err: value?.error,
      response: value?.data,
      isDisposed: true,
    };
  }
}
