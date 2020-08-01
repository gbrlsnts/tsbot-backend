import { PermissionDto } from './permission.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class SetPermissionsDto {
  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  permissions: PermissionDto[];
}
