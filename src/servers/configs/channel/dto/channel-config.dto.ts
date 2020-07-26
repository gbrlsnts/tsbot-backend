import { PermissionDto } from './permission.dto';
export class ChannelConfigDto {
  zoneId?: number;
  allowedSubChannels: number;
  codecId: number;
  codecQuality: number;
  permissions: PermissionDto[];
}