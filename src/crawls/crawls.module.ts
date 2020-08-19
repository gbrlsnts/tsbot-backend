import { Module } from '@nestjs/common';
import { CrawlsService } from './crawls.service';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [ServersModule],
  providers: [CrawlsService],
  exports: [CrawlsService],
})
export class CrawlsModule {}
