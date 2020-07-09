import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { ServerRolesOptions } from '../guards/server-roles.guard';
import { serverRolesMetadataKey } from '../../auth/constants';

export const SetServerRoles = (
  roles: ServerRolesOptions,
): CustomDecorator<string> => SetMetadata(serverRolesMetadataKey, roles);
