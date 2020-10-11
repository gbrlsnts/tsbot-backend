import { Module } from '@nestjs/common';
import { ConfigListenerService } from './config.service';
import { ServersModule } from '../servers/servers.module';
import { ConfigListenerController } from './config.controller';
import { TeamspeakCommonModule } from '../teamspeak-common/teamspeak-common.module';

@Module({
  imports: [ServersModule, TeamspeakCommonModule],
  providers: [ConfigListenerService],
  controllers: [ConfigListenerController],
})
export class TeamspeakListenerModule {}
