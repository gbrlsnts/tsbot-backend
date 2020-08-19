import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlsService } from './crawls.service';
import { ServersModule } from '../servers/servers.module';
import { InactiveChannelRepository } from './inactive-channel.repository';
import { CrawlRepository } from './crawl.repository';
import { CrawlZoneRepository } from './crawl-zone.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InactiveChannelRepository,
      CrawlRepository,
      CrawlZoneRepository,
    ]),
    ServersModule,
  ],
  providers: [CrawlsService],
  exports: [CrawlsService],
})
export class CrawlsModule {}
