import { IsBoolean, IsOptional } from "class-validator";

export class CategoryFiltersDto {
  @IsBoolean()
  @IsOptional()
  withGroups: boolean;
}