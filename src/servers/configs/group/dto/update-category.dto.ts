import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @IsOptional()
  name?: string;

  @IsPositive({
    each: true,
  })
  @IsOptional()
  groups?: number[];
}
