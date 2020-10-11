import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { natsInboundOptions } from './shared/nats/nats.config';

const port = process.env.APP_PORT || config.get('server.port');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>(natsInboundOptions, {
    inheritAppConfig: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.startAllMicroservicesAsync();
  await app.listen(port);
}
bootstrap();
