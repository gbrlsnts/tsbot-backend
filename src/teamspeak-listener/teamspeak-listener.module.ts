import { Module } from '@nestjs/common';
import { ConfigListenerService } from './config.service';
import { ServersModule } from '../servers/servers.module';
import { ConfigListenerController } from './config.controller';
import { TeamspeakCommonModule } from '../teamspeak-common/teamspeak-common.module';
import { CrawlerListenerService } from './crawler.service';
import { CrawlListenerController } from './crawler.controller';
import { CrawlsModule } from 'src/crawls/crawls.module';

@Module({
  imports: [ServersModule, CrawlsModule, TeamspeakCommonModule],
  providers: [ConfigListenerService, CrawlerListenerService],
  controllers: [ConfigListenerController, CrawlListenerController],
})
export class TeamspeakListenerModule {}
