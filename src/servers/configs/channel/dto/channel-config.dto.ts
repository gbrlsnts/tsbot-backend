import {
  IsPositive,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionDto } from './permission.dto';

// add missing validation. dont allow zone id when updating
export class ChannelConfigDto {
  @IsPositive()
  @IsOptional({
    groups: ['post'],
  })
  @IsDefined({
    groups: ['post'],
  })
  zoneId?: number;

  @IsPositive()
  @IsOptional({
    groups: ['patch'],
  })
  allowedSubChannels: number;

  @IsPositive()
  @IsOptional({
    groups: ['patch'],
  })
  codecId: number;

  @Min(0)
  @Max(10)
  @IsOptional({
    groups: ['patch'],
  })
  codecQuality: number;

  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  @IsDefined({
    groups: ['post'],
  })
  permissions: PermissionDto[];
}
