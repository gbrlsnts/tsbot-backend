import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import {
  CreateUserChannelResultData,
  DeleteChannelData,
  CreateSubChannelData,
} from './types/user-channel';
import {
  createChannelSubject,
  deleteChannelSubject,
  getChannelIsUniqueSubject,
} from './subjects';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import {
  createSubChannelSubject,
  getChannelZoneSubject,
  getSubChannelCountSubject,
} from './subjects';
import { ValidateChannelUniqueRequest } from './types/channel';
import { GetChannelZoneRequest } from './types/channel';
import { GetChannelZoneResponse } from './types/channel';
import { UserChannelConfiguration } from 'src/teamspeak/types/user-channel';

@Injectable()
export class TsUserChannelService {
  constructor(private busService: TeamspeakBusService) {}

  /**
   * Creates a channel in teamspeak and returns the id
   * Pending implementation
   * @param serverId server id to create the channel
   * @param tsClientDbId teamspeak db id of the user creating the channel
   * @param zone zone where the channel will be created. should include channel config relation
   * @param channelData channel data
   */
  async createUserChannel(
    serverId: number,
    tsClientDbId: number,
    zone: Zone,
    channelData: UserChannelConfiguration,
  ): Promise<number> {
    const data = this.buildChannelCreatePayload(
      zone,
      channelData,
      tsClientDbId,
    );

    const result = await this.busService.send<CreateUserChannelResultData>(
      createChannelSubject(serverId),
      data,
    );

    return result.channel;
  }

  /**
   * Creates a sub channel in teamspeak and returns the id
   * Pending implementation
   * @param serverId server id to create the sub channel
   * @param zone where the root channel sits in
   * @param tsChannelId teamspeak owner db id of the parent channel
   * @param tsClientDbId teamspeak db id of the parent channel owner
   * @param channelData channel data
   */
  createUserSubChannel(
    serverId: number,
    zone: Zone,
    tsChannelId: number,
    tsClientDbId: number,
    channelData: UserChannelConfiguration[],
  ): Promise<void> {
    const data = this.buildChannelCreatePayload(
      zone,
      channelData,
      tsClientDbId,
      tsChannelId,
    );

    return this.busService.send<void>(createSubChannelSubject(serverId), data);
  }

  /**
   * Deletes a channel in the voice server
   * @param serverId
   * @param zone where the channel sits in
   * @param tsChannelId channel to delete
   * @param tsRootChannelId when the channel to delete is a sub channel id, this should be the root/top channel id.
   *        the root channel is also the id stored in the channel entity
   */
  async deleteUserChannel(
    serverId: number,
    zone: Zone,
    tsChannelId: number,
    tsRootChannelId?: number,
  ): Promise<void> {
    const data: DeleteChannelData = {
      zone: zone.toBotData(),
      channelId: tsChannelId,
      rootChannelId: tsRootChannelId,
    };

    await this.busService.send<boolean>(deleteChannelSubject(serverId), data);
  }

  /**
   * Build a payload for the create channel requests
   * @param zone zone where the channel is/will be
   * @param dto dto with channel data
   * @param tsClientDbId channel owner ts3 database id
   * @param tsRootChannelId root channel id when creating sub channels
   */
  private buildChannelCreatePayload(
    zone: Zone,
    channelData: UserChannelConfiguration | UserChannelConfiguration[],
    tsClientDbId: number,
    tsRootChannelId?: number,
  ): CreateSubChannelData {
    return {
      owner: tsClientDbId,
      group: zone.channelConfig.adminGroup.tsId,
      rootChannelId: tsRootChannelId,
      channels: channelData instanceof Array ? channelData : [channelData],
      zone: zone.toBotData(),
      permissions: zone.channelConfig.toBotPermissions(),
      properties: {
        audio: zone.channelConfig.toBotAudio(),
      },
    };
  }

  /**
   *
   * @param serverId server id
   * @param channels channel names to check
   * @param tsRootChannelId if checking subchannels then set the param
   */
  sendChannelIsUniqueRequest(
    serverId: number,
    channels: string[],
    tsRootChannelId?: number,
  ): Promise<boolean> {
    const isUniqueRequestData: ValidateChannelUniqueRequest = {
      channels,
      rootChannelId: tsRootChannelId,
    };

    return this.busService.send<boolean>(
      getChannelIsUniqueSubject(serverId),
      isUniqueRequestData,
    );
  }

  /**
   * Count sub channels of a ts3 channel id
   * @param serverId
   * @param tsChannelId channel id to count subchannels
   */
  countSubChannels(serverId: number, tsChannelId: number): Promise<number> {
    return this.busService.send<number>(getSubChannelCountSubject(serverId), {
      channelId: tsChannelId,
    });
  }

  /**
   * Get the zone a channel is currently sitting at. Allows to get the real time zone even if the channel was moved.
   * @param serverId
   * @param zones all zones configured in the server
   * @param tsRootChannelId root channel id when creating sub channels
   */
  getZoneOfChannel(
    serverId: number,
    zones: Zone[],
    tsRootChannelId: number,
  ): Promise<GetChannelZoneResponse> {
    const data: GetChannelZoneRequest = {
      channelId: tsRootChannelId,
      zones: zones.map(z => {
        return { id: z.id, ...z.toBotData() };
      }),
    };

    // no id -> channel not in any zone!
    return this.busService.send<GetChannelZoneResponse>(
      getChannelZoneSubject(serverId),
      data,
    );
  }
}
