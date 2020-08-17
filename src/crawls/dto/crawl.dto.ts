import { CrawlZoneDto } from './crawl-zone.dto';

export class CrawlDto {
  runAt: Date;
  zones: CrawlZoneDto[];
}