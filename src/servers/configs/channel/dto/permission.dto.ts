import { IsPositive, IsNumber } from 'class-validator';

export class PermissionDto {
  @IsPositive()
  permissionId: number;

  @IsNumber()
  value: number;
}
