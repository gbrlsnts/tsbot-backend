import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { ChannelDto } from '../channels/dto/channel.dto';
import { SubChannelDto } from 'src/channels/dto/sub-channel.dto';
import { ChannelConfigService } from '../servers/configs/channel/channel-config.service';
import {
  CreateUserChannelResultData,
  DeleteChannelData,
  CreateSubChannelData,
} from './types/user-channel';
import { ZoneService } from '../servers/configs/zone/zone.service';
import {
  subchannelsExceedMax,
  channelNameAlreadyExists,
} from '../shared/messages/channel.messages';
import {
  createChannelSubject,
  deleteChannelSubject,
  getSubChannelCountSubject,
  getChannelIsUniqueSubject,
  getUserServerGroupsSubject,
} from './subjects';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import { createSubChannelSubject, getChannelZoneSubject } from './subjects';
import { ValidateChannelUniqueRequest, ZoneInfo } from './types/channel';
import { InvalidConfigurationException } from '../shared/exceptions/InvalidConfigurationException';
import { zoneWithoutConfig } from 'src/shared/messages/server.messages';
import { channelOutsideOfZone } from '../shared/messages/channel.messages';
import { GetChannelZoneRequest } from './types/channel';
import { GetChannelZoneResponse } from './types/channel';
import { InvalidTeamspeakChannelException } from './exceptions';

@Injectable()
export class UserChannelService {
  constructor(
    private busService: TeamspeakBusService,
    private channelConfigService: ChannelConfigService,
    private zoneService: ZoneService,
  ) {}

  /**
   * Creates a channel in teamspeak and returns the id
   * Pending implementation
   * @param serverId server id to create the channel
   * @param tsClientDbId teamspeak db id of the user creating the channel
   * @param dto channel data
   */
  async createUserChannel(
    serverId: number,
    tsClientDbId: number,
    dto: ChannelDto,
  ): Promise<number> {
    const [isUnique, { zone, config }] = await Promise.all([
      this.sendIsUniqueRequest(serverId, [dto.name]),
      this.getZoneInfo(serverId, tsClientDbId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (dto.subchannels.length > config.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(
      config,
      zone,
      dto,
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
   * @param tsChannelId teamspeak owner db id of the parent channel
   * @param tsClientDbId teamspeak db id of the parent channel owner
   * @param dto channel data
   */
  async createUserSubChannel(
    serverId: number,
    tsChannelId: number,
    tsClientDbId: number,
    dto: SubChannelDto,
  ): Promise<void> {
    const [isUnique, subChannelCount, { zone, config }] = await Promise.all([
      this.sendIsUniqueRequest(serverId, dto.subchannels, tsChannelId),
      this.busService.send<number>(getSubChannelCountSubject(serverId), {
        channelId: tsChannelId,
      }),
      this.getZoneInfoOfExistingChannel(serverId, tsChannelId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (subChannelCount + dto.subchannels.length > config.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(
      config,
      zone,
      dto,
      tsClientDbId,
      tsChannelId,
    );

    await this.busService.send(createSubChannelSubject(serverId), data);
  }

  /**
   * Deletes a channel in the voice server
   * @param serverId
   * @param tsChannelId channel to delete
   * @param tsRootChannelId when the channel to delete is a sub channel id, this should be the root/top channel id.
   *        the root channel is also the id stored in the channel entity
   */
  async deleteUserChannel(
    serverId: number,
    tsChannelId: number,
    tsRootChannelId?: number,
  ): Promise<void> {
    let info: ZoneInfo;

    try {
      info = await this.getZoneInfoOfExistingChannel(serverId, tsChannelId);
    } catch (error) {
      if (error instanceof InvalidTeamspeakChannelException) return;
      throw error;
    }

    const data: DeleteChannelData = {
      zone: info.zone.toBotData(),
      channelId: tsChannelId,
      rootChannelId: tsRootChannelId,
    };

    await this.busService.send<boolean>(deleteChannelSubject(serverId), data);
  }

  /**
   * Build a payload for the create channel requests
   * @param channelConfig channel config to apply
   * @param zone zone where the channel is/will be
   * @param dto dto with channel data
   * @param tsClientDbId channel owner ts3 database id
   * @param tsRootChannelId root channel id when creating sub channels
   */
  private async buildChannelCreatePayload(
    channelConfig: ChannelConfig,
    zone: Zone,
    dto: ChannelDto | SubChannelDto,
    tsClientDbId: number,
    tsRootChannelId?: number,
  ): Promise<CreateSubChannelData> {
    return {
      owner: tsClientDbId,
      rootChannelId: tsRootChannelId,
      channels:
        dto instanceof ChannelDto ? [dto.toBotChannel()] : dto.toBotChannel(),
      zone: zone.toBotData(),
      permissions: channelConfig.toBotPermissions(),
      properties: {
        audio: channelConfig.toBotAudio(),
      },
    };
  }

  /**
   *
   * @param serverId server id
   * @param channels channel names to check
   * @param tsRootChannelId if checking subchannels then set the param
   */
  private sendIsUniqueRequest(
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
   * Get the zone a channel is currently sitting at. Allows to get the real time zone even if the channel was moved.
   * @param serverId
   * @param tsRootChannelId root channel id when creating sub channels
   */
  async getZoneInfoOfExistingChannel(
    serverId: number,
    tsRootChannelId: number,
  ): Promise<ZoneInfo> {
    const zones = await this.zoneService.getAllZonesByServer(serverId);

    const data: GetChannelZoneRequest = {
      channelId: tsRootChannelId,
      zones: zones.map(z => {
        return { id: z.id, ...z.toBotData() };
      }),
    };

    // no id -> channel not in any zone!
    const res = await this.busService.send<GetChannelZoneResponse>(
      getChannelZoneSubject(serverId),
      data,
    );

    if (!res.zoneId && res.existsOutOfZone)
      throw new UnprocessableEntityException(channelOutsideOfZone);
    else if (!res.zoneId && !res.existsOutOfZone)
      throw new InvalidTeamspeakChannelException();

    const zone = zones.find(z => z.id === res.zoneId);
    const config = await this.getZoneConfigSafe(serverId, zone.id);

    return { zone, config };
  }

  /**
   * Get the best fitting zone according to a user's groups
   * @param serverId
   * @param tsClientDbId
   */
  private async getZoneByUserGroup(
    serverId: number,
    tsClientDbId: number,
  ): Promise<Zone> {
    const [groups, zones] = await Promise.all([
      this.busService.send<number[]>(
        getUserServerGroupsSubject(serverId),
        tsClientDbId,
      ),
      this.zoneService.getAllZonesByServer(serverId, { relations: ['group'] }),
    ]);

    const defaultZone = zones.find(z => !z.groupId);
    const bestFitZone = zones.find(z => groups.includes(z?.group?.tsId));

    return bestFitZone ?? defaultZone;
  }

  /**
   * Get the best fitting zone according to a user's groups and zone's channel config
   * @param serverId
   * @param tsClientDbId
   */
  private async getZoneInfo(
    serverId: number,
    tsClientDbId: number,
  ): Promise<ZoneInfo> {
    const zone = await this.getZoneByUserGroup(serverId, tsClientDbId);
    const config = await this.getZoneConfigSafe(serverId, zone.id);

    return { zone, config };
  }

  /**
   * Returns a zone's channel config and fails with invalid config if none was found.
   * @param serverId
   * @param zoneId
   * @throws InvalidConfigurationException when the zone has no config
   */
  private async getZoneConfigSafe(
    serverId: number,
    zoneId: number,
  ): Promise<ChannelConfig> {
    try {
      const config = await this.channelConfigService.getConfig(
        {
          serverId,
          zoneId,
        },
        { relations: ['permissions', 'codec'] },
      );

      return config;
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new InvalidConfigurationException(zoneWithoutConfig);
    }
  }
}
