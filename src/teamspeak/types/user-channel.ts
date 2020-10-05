import { ChannelProperties, ChannelPermission } from './channel';

export interface ZoneChannel {
  /** The zone where channel is/will be located */
  zone: Zone;
}

export interface CreateChannelData extends ZoneChannel {
  /** The channels configuration which will be created for the user */
  channels: UserChannelConfiguration[];
  /** Channels' owner database Id */
  owner?: number;
  /** Channel group to assign, if any. Owner must be defined */
  group?: number;
  /** Permissions to assign to all channels created by the action */
  permissions?: ChannelPermission[];
  /** Properties to apply to all channels created by the action */
  properties?: ChannelProperties;
}

export interface CreateSubChannelData extends CreateChannelData {
  /** Parent to create sub channel */
  rootChannelId: number;
}

export interface DeleteChannelData extends ZoneChannel {
  /** Channel to delete */
  channelId: number;
  /** When deleting a subchannel, the root channel is mandatory for validation */
  rootChannelId?: number;
}

export interface UserChannelConfiguration {
  /** The channel name */
  name: string;
  /** The channel password, optional */
  password?: string;
  /** Sub channels configurations to create for this channel */
  channels: UserChannelConfiguration[];
  /** Permissions to assign to this channel */
  permissions?: ChannelPermission[];
  /** Properties to apply to the channel */
  properties?: ChannelProperties;
}

export interface Zone {
  /** Channel id where the zone starts */
  start: number;
  /** Channel id where the zone ends */
  end: number;
  /** If channel separators are enabled for this zone */
  separators: boolean;
}

export interface CreateUserChannelResultData {
  /** Id of the newly created top channel */
  channel: number;
  /** Ids of channel's subchannels */
  subchannels: number[];
}

export interface CreateUserSubChannelResultData {
  /** The created channels id */
  channels: number[];
}

export interface GetChannelZoneRequest {
  channelId: number;
  zones: Zone[];
}
