import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { serverRolesMetadataKey } from '../../shared/constants';
import { ServerRoles } from '../guards/server-roles.guard';

export const SetServerRoles = (
  roles: ServerRoles[],
  idParam?: string,
): CustomDecorator<string> =>
  SetMetadata(serverRolesMetadataKey, { roles, idParam });
