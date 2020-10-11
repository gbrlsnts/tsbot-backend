import { Module } from '@nestjs/common';
import { ConfigListenerService } from './config.service';
import { ServersModule } from '../servers/servers.module';
import { ConfigListenerController } from './config.controller';
import { TeamspeakCommonModule } from '../teamspeak-common/teamspeak-common.module';
import { botProvider } from '../shared/nats/ts-bot.provider';

@Module({
  imports: [ServersModule, TeamspeakCommonModule],
  providers: [botProvider, ConfigListenerService],
  controllers: [ConfigListenerController],
})
export class TeamspeakListenerModule {}
