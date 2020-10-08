import { IsString, IsOptional, Min } from 'class-validator';

export class CrawlZoneDto {
  @IsString()
  zone: string | number;

  @Min(0)
  inactiveChannels: number;

  @Min(0)
  @IsOptional()
  deletedChannels: number;

  @Min(0)
  totalChannels: number;
}
