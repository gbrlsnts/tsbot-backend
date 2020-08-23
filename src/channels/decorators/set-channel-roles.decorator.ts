import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { channelRolesMetadataKey } from '../../shared/constants';
import { ChannelRoles } from '../guard/channel-roles.guard';

export const SetChannelRoles = (
  roles: ChannelRoles[],
  idParam?: string,
): CustomDecorator<string> =>
  SetMetadata(channelRolesMetadataKey, { roles, idParam });
