import { IsPositive, IsOptional, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsPositive()
  @IsOptional()
  allowedSubChannels: number;

  @IsPositive()
  @IsOptional()
  codecId: number;

  @Min(0)
  @Max(10)
  @IsOptional()
  codecQuality: number;
}
