import { IsPositive, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class InactiveChannelDto {
  @IsPositive()
  tsChannelId: number;

  @IsPositive()
  timeInactive: number;

  @IsBoolean()
  isNotified: boolean;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
