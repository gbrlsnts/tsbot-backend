import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class GroupCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;
}