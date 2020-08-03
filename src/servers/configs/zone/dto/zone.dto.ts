import { IsPositive, IsBoolean, IsOptional, IsString, IsNotEmpty, Min, Max } from "class-validator";
import { LessThanField } from '../../../../shared/validation/less-than-field.validation';

export class ZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  channelIdStart: number;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  channelIdEnd: number;

  @IsBoolean()
  @IsOptional({
    groups: ['patch']
  })
  separator: boolean;

  @Min(5)
  @LessThanField('minutesInactiveDelete')
  @IsOptional({
    groups: ['patch']
  })
  minutesInactiveNotify: number;

  @Min(5)
  @Max(1052000)
  @IsOptional({
    groups: ['patch']
  })
  minutesInactiveDelete: number;
}