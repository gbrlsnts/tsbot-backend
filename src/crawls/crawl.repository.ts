import { Repository, EntityRepository } from 'typeorm';
import { Crawl } from './crawl.entity';

@EntityRepository(Crawl)
export class CrawlRepository extends Repository<Crawl> {}