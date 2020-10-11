import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, NatsContext } from '@nestjs/microservices';
import { ConfigListenerService } from './config.service';
import { getServerConfigSubject } from '../teamspeak/subjects';
import { Configuration } from '../teamspeak/types/server';

@Controller()
export class ConfigListenerController {
  constructor(private readonly configService: ConfigListenerService) {}

  @MessagePattern(getServerConfigSubject)
  getServerConfig(@Ctx() context: NatsContext): Promise<Configuration> {
    const serverId = Number(context.getSubject().split('.')[2]); // refactor this

    return this.configService.getServerConfig(serverId);
  }
}
