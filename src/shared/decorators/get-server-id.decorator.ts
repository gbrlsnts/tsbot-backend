import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';

export const GetServerId = createParamDecorator(
  (data, ctx: ExecutionContext): number => {
    const natsCtx = ctx.switchToRpc().getContext<NatsContext>();

    const id = Number(natsCtx.getSubject().split('.')[2]);
    if (!id) throw new Error('invalid server id');

    return id;
  },
);
