import { PermissionDto } from './permission.dto';

// add missing validation. dont allow zone id when updating
export class ChannelConfigDto {
  zoneId?: number;
  allowedSubChannels: number;
  codecId: number;
  codecQuality: number;
  permissions: PermissionDto[];
}
