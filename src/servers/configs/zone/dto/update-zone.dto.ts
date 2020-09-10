import {
  IsPositive,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { LessThanField } from '../../../../shared/validation/less-than-field.validation';

export class UpdateZoneDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsPositive()
  @IsOptional()
  channelIdStart: number;

  @IsPositive()
  @IsOptional()
  channelIdEnd: number;

  @IsBoolean()
  @IsOptional()
  separator: boolean;

  @Min(5)
  @LessThanField('minutesInactiveDelete')
  @IsOptional()
  minutesInactiveNotify: number;

  @Min(5)
  @Max(1052000)
  @IsOptional()
  minutesInactiveDelete: number;

  @IsBoolean()
  crawl: boolean;
}
