import { Injectable } from '@nestjs/common';
import { InactiveChannelRepository } from './inactive-channel.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Crawl } from './crawl.entity';
import { CrawlRepository } from './crawl.repository';
import { CrawlZone } from './crawl-zone.entity';
import { CrawlDto } from './dto/crawl.dto';

@Injectable()
export class CrawlsService {
   constructor(
     @InjectRepository(InactiveChannelRepository)
     private inactiveRepository: InactiveChannelRepository,
     @InjectRepository(CrawlRepository)
     private crawlRepository: CrawlRepository,
     @InjectRepository(CrawlZone)
     private crawlZoneRepository: CrawlZone
    ) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getLastCrawl(serverId): Promise<Crawl> {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async storeCrawl(serverId: number, dto: CrawlDto): Promise<Crawl> {
      return;
    }
}
