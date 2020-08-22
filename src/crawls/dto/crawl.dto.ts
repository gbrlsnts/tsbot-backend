import { CrawlZoneDto } from './crawl-zone.dto';
import {
  IsArray,
  IsDate,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrawlDto {
  @IsDate()
  @Type(() => Date)
  runAt: Date;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({
    each: true,
  })
  @Type(() => CrawlZoneDto)
  zones: CrawlZoneDto[];
}
