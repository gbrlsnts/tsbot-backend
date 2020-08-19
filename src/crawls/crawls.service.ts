import { Injectable, BadRequestException } from '@nestjs/common';
import { InactiveChannelRepository } from './inactive-channel.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Crawl } from './crawl.entity';
import { CrawlRepository } from './crawl.repository';
import { CrawlZoneRepository } from './crawl-zone.repository';
import { CrawlZone } from './crawl-zone.entity';
import { CrawlDto } from './dto/crawl.dto';
import { ZoneService } from '../servers/configs/zone/zone.service';
import { zoneInvalid } from '../shared/messages/server.messages';

@Injectable()
export class CrawlsService {
   constructor(
     @InjectRepository(InactiveChannelRepository)
     private inactiveRepository: InactiveChannelRepository,
     @InjectRepository(CrawlRepository)
     private crawlRepository: CrawlRepository,
     @InjectRepository(CrawlZone)
     private crawlZoneRepository: CrawlZoneRepository,
     private zoneService: ZoneService,
    ) {}

    async getLastCrawl(serverId: number): Promise<Crawl> {
      return this.crawlRepository.findOne({
        where: { serverId },
        order: {
          runAt: 'DESC',
        },
      });
    }

    async storeCrawl(serverId: number, dto: CrawlDto): Promise<Crawl> {
      const { zones, runAt } = dto;
      const crawl = this.crawlRepository.create({ runAt });

      const crawlZones = await Promise.all(zones.map(async z => {
        const { zone: dirtyZone, inactiveChannels, totalChannels } = z;

        let zoneId = Number(dirtyZone);

        if(!zoneId) {
          try {
            zoneId = await this.zoneService.getZoneIdByName(
              dirtyZone.toString(), 
              serverId
            );
          } catch (e) {
            throw new BadRequestException(zoneInvalid);
          }
        }

        return {
          zoneId,
          inactiveChannels,
          totalChannels,
        };
      }));

      crawl.zones = this.crawlZoneRepository.create(crawlZones);
      
      return this.crawlRepository.save(crawl);
    }
}
