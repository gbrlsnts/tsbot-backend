import { Repository, EntityRepository } from 'typeorm';
import { CrawlZone } from './crawl-zone.entity';

@EntityRepository(CrawlZone)
export class CrawlZoneRepository extends Repository<CrawlZone> {}