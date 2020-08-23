import { ClassTransformOptions } from 'class-transformer';

export const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const serverRolesMetadataKey = 'server-roles-guard';
export const channelRolesMetadataKey = 'channel-roles-guard';

export const appSerializeOptions: ClassTransformOptions = {
  strategy: 'excludeAll',
  excludePrefixes: ['_'],
};
