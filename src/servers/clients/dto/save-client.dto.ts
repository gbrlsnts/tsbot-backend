import { IsInt, Min, Length } from 'class-validator';

export class SaveClientDto {
  @Length(28)
  tsUniqueId: string;

  @IsInt()
  @Min(1)
  tsClientDbId: number;
}
