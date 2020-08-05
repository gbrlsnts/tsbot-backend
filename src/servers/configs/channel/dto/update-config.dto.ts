import { IsPositive, IsOptional, Min, Max } from 'class-validator';

export class UpdateConfigDto {
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
}
