import { IsBase64, IsNotEmpty } from 'class-validator';

export class UploadIconDto {
  @IsBase64()
  @IsNotEmpty()
  content: string;
}
