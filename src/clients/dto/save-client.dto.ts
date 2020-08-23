import { IsInt, Min, IsPositive } from 'class-validator';
import { FixedLength } from '../../validation/fixed-length.validation';

export class SaveClientDto {
  @IsPositive()
  userId: number;

  @FixedLength(28)
  tsUniqueId: string;

  @IsInt()
  @Min(1)
  tsClientDbId: number;
}
