import {
  IsPositive,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionDto } from './permission.dto';

export class CreateConfigDto {
  @IsPositive()
  zoneId: number;

  @IsPositive()
  allowedSubChannels: number;

  @IsPositive()
  @IsOptional()
  codecId: number;

  @Min(0)
  @Max(10)
  @IsOptional()
  codecQuality: number;

  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  permissions: PermissionDto[];
}
