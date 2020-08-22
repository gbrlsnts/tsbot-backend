import { IsPositive, IsString, IsOptional } from 'class-validator';

export class CrawlZoneDto {
  @IsString()
  zone: string | number;

  @IsPositive()
  inactiveChannels: number;

  @IsPositive()
  @IsOptional()
  deletedChannels: number;

  @IsPositive()
  totalChannels: number;
}
