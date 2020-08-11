import { IsString, IsNotEmpty, MaxLength, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @Type(() => Set)
  @IsPositive({
    each: true,
  })
  groups: Set<number>;
}