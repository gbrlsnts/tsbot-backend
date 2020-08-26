import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CategoryFiltersDto {
  @IsOptional()
  @Transform(v => v == 'true' || v == '1')
  withGroups: boolean;
}
