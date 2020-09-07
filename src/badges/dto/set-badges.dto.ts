import { IsPositive, ArrayUnique } from 'class-validator';

export class SetBadgesDto {
  @IsPositive({
    each: true,
  })
  @ArrayUnique()
  groups: number[];
}
