import {
  IsPositive,
  IsBoolean,
  IsString,
  IsNotEmpty,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { LessThanField } from '../../../../shared/validation/less-than-field.validation';
import { IsOptional } from 'class-validator';

export class CreateZoneDto {
  @IsPositive()
  @IsOptional()
  groupId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPositive()
  channelIdStart: number;

  @IsPositive()
  channelIdEnd: number;

  @IsBoolean()
  separator: boolean;

  @Min(5)
  @LessThanField('minutesInactiveDelete')
  @ValidateIf(z => z.crawl)
  minutesInactiveNotify: number;

  @Min(5)
  @Max(1052000)
  @ValidateIf(z => z.crawl)
  minutesInactiveDelete: number;

  @IsBoolean()
  crawl: boolean;
}
