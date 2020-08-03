import { IsPositive, IsBoolean, IsString, IsNotEmpty, Min, Max } from "class-validator";
import { LessThanField } from '../../../../shared/validation/less-than-field.validation';

export class CreateZoneDto {
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
  minutesInactiveNotify: number;

  @Min(5)
  @Max(1052000)
  minutesInactiveDelete: number;
}