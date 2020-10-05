import { ChannelConfig } from '../../servers/configs/channel/channel-config.entity';
import { Zone } from '../../servers/configs/zone/zone.entity';

export interface ChannelProperties {
  /** Audio quality */
  audio?: AudioQuality;
}

export enum BotCodec {
  OPUS_VOICE = 'OPUS_VOICE', // opus voice = 4
  OPUS_MUSIC = 'OPUS_MUSIC', // opus music = 5
}

export interface AudioQuality {
  /** Codec to set */
  codec: BotCodec;
  /** Quality, 0 to 10 */
  quality: number;
}

export interface ChannelPermission {
  /** The permission id */
  permission: string;
  /** The permission value */
  value: number;
}

export interface ChannelIdRequest {
  channelId: number;
}

export interface ValidateChannelUniqueRequest {
  channels: string[];
  rootChannelId?: number;
}

export interface ZoneInfo {
  zone: Zone;
  config: ChannelConfig;
}
