import { IsInt, Min } from 'class-validator';
import { FixedLength } from '../../../validation/fixed-length.validation';

export class SaveClientDto {
  @FixedLength(28)
  tsUniqueId: string;

  @IsInt()
  @Min(1)
  tsClientDbId: number;
}
