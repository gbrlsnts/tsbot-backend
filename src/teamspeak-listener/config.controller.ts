import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ConfigListenerService } from './config.service';
import {
  botConnectionLostEventSubject,
  getServerConfigSubject,
  getServersToLoadSubject,
} from '../teamspeak/subjects';
import { Configuration } from '../teamspeak/types/server';
import { GetServerId } from 'src/shared/decorators/get-server-id.decorator';

@Controller()
export class ConfigListenerController {
  constructor(private readonly configService: ConfigListenerService) {}

  @MessagePattern(getServersToLoadSubject)
  getServersToLoad(): Promise<number[]> {
    return this.configService.getServersToLoad();
  }

  @MessagePattern(getServerConfigSubject)
  getServerConfig(@GetServerId() serverId: number): Promise<Configuration> {
    return this.configService.getServerConfig(serverId);
  }

  @MessagePattern(botConnectionLostEventSubject)
  setConnectionProblem(@GetServerId() serverId: number): Promise<void> {
    return this.configService.setConnectionError(serverId, true);
  }
}
