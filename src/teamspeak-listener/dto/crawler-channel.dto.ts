import {
  IsDateString,
  IsPositive,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Min, IsBoolean } from 'class-validator';

export class CrawlerChannelListDto {
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => CrawlerChannelDto)
  channelList: CrawlerChannelDto[];
}

export class CrawlerChannelDto {
  @IsPositive()
  channelId: number;

  @Min(0)
  timeInactive: number;

  @IsBoolean()
  @IsOptional()
  isNotified?: boolean;

  @IsDateString()
  lastUpdated: Date;
}
