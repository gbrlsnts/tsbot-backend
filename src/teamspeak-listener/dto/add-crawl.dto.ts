import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CrawlDto } from '../../crawls/dto/crawl.dto';

export class AddCrawlDto {
  @ValidateNested()
  @Type(() => CrawlDto)
  crawl: CrawlDto; // reuse existing dto
}
