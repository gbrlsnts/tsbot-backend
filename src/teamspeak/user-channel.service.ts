import {
  Injectable,
  BadRequestException,
  NotFoundException,
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
import { createSubChannelSubject } from './subjects';
import { ValidateChannelUniqueRequest } from './types/channel';
import { InvalidConfigurationException } from '../shared/exceptions/InvalidConfigurationException';
import { zoneWithoutConfig } from 'src/shared/messages/server.messages';

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
      this.getZoneWithConfig(serverId, tsClientDbId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (dto.subchannels.length > config.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(config, zone, dto);

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
      this.getZoneWithConfig(serverId, tsClientDbId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (subChannelCount + dto.subchannels.length > config.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(
      config,
      zone,
      dto,
      tsChannelId,
    );

    await this.busService.send(createSubChannelSubject(serverId), data);
  }

  /**
   * Deletes a channel in the voice server
   * @param serverId
   * @param tsChannelId teamspeak owner db id of the root channel
   * @param tsChannelId channel to delete
   * @param tsRootChannelId when the channel to delete is a sub channel id, this should be the root/top channel id.
   *        the root channel is also the id stored in the channel entity
   */
  async deleteUserChannel(
    serverId: number,
    tsClientDbId: number,
    tsChannelId: number,
    tsRootChannelId?: number,
  ): Promise<void> {
    const zone = await this.getZoneByUserGroup(serverId, tsClientDbId);

    const data: DeleteChannelData = {
      zone: zone.toBotData(),
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
   * @param tsRootChannelId root channel id when creating sub channels
   */
  private async buildChannelCreatePayload(
    channelConfig: ChannelConfig,
    zone: Zone,
    dto: ChannelDto | SubChannelDto,
    tsRootChannelId?: number,
  ): Promise<CreateSubChannelData> {
    return {
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
  private async getZoneWithConfig(
    serverId: number,
    tsClientDbId: number,
  ): Promise<{ zone: Zone; config: ChannelConfig }> {
    const zone = await this.getZoneByUserGroup(serverId, tsClientDbId);

    try {
      const config = await this.channelConfigService.getConfig({
        serverId,
        zoneId: zone.id,
      });

      return { zone, config };
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new InvalidConfigurationException(zoneWithoutConfig);
    }
  }
}
