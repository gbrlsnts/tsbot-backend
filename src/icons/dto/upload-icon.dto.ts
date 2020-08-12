import { IsBase64, IsInt, Max, IsPositive, IsNotEmpty } from "class-validator";

export class UploadIconDto {
  @IsInt()
  @IsPositive()
  @Max(2147483647)
  tsId: number;

  @IsBase64()
  @IsNotEmpty()
  content: string;
}