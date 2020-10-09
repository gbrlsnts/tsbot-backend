import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ChannelDto } from './dto/channel.dto';
import { SubChannelDto } from 'src/channels/dto/sub-channel.dto';
import { ChannelConfigService } from '../servers/configs/channel/channel-config.service';
import { ZoneService } from '../servers/configs/zone/zone.service';
import {
  subchannelsExceedMax,
  channelNameAlreadyExists,
} from '../shared/messages/channel.messages';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import { InvalidConfigurationException } from '../shared/exceptions/InvalidConfigurationException';
import { zoneWithoutConfig } from 'src/shared/messages/server.messages';
import { channelOutsideOfZone } from '../shared/messages/channel.messages';
import { TsUserChannelService } from '../teamspeak/user-channel.service';
import { ServerGroupService } from '../teamspeak/server-groups.service';
import { InvalidTeamspeakChannelException } from '../teamspeak/exceptions';

@Injectable()
export class UserChannelService {
  constructor(
    private readonly userChannelService: TsUserChannelService,
    private readonly serverGroupService: ServerGroupService,
    private readonly channelConfigService: ChannelConfigService,
    private readonly zoneService: ZoneService,
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
    const [isUnique, zone] = await Promise.all([
      this.userChannelService.sendChannelIsUniqueRequest(serverId, [dto.name]),
      this.getZoneInfo(serverId, tsClientDbId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (dto.subchannels.length > zone.channelConfig.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    return this.userChannelService.createUserChannel(
      serverId,
      tsClientDbId,
      zone,
      dto.toBotChannel(),
    );
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
    const [isUnique, subChannelCount, zone] = await Promise.all([
      this.userChannelService.sendChannelIsUniqueRequest(
        serverId,
        dto.subchannels,
        tsChannelId,
      ),
      this.userChannelService.countSubChannels(serverId, tsChannelId),
      this.getZoneOfChannel(serverId, tsChannelId),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (
      subChannelCount + dto.subchannels.length >
      zone.channelConfig.allowedSubChannels
    )
      throw new BadRequestException(subchannelsExceedMax);

    await this.userChannelService.createUserSubChannel(
      serverId,
      zone,
      tsChannelId,
      tsClientDbId,
      dto.toBotChannel(),
    );
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
    let zone: Zone;

    try {
      zone = await this.getZoneOfChannel(
        serverId,
        tsRootChannelId ?? tsChannelId,
      );
    } catch (error) {
      if (error instanceof InvalidTeamspeakChannelException) return;
      throw error;
    }

    await this.userChannelService.deleteUserChannel(
      serverId,
      zone,
      tsChannelId,
      tsRootChannelId,
    );
  }

  /**
   * Get the zone a channel is currently sitting at. Allows to get the real time zone even if the channel was moved.
   * @param serverId
   * @param tsRootChannelId root channel id when creating sub channels
   */
  async getZoneOfChannel(
    serverId: number,
    tsRootChannelId: number,
  ): Promise<Zone> {
    const zones = await this.zoneService.getAllZonesByServer(serverId);

    // no id -> channel not in any zone!
    const res = await this.userChannelService.getZoneOfChannel(
      serverId,
      zones,
      tsRootChannelId,
    );

    if (!res.zoneId && res.existsOutOfZone)
      throw new UnprocessableEntityException(channelOutsideOfZone);
    else if (!res.zoneId && !res.existsOutOfZone)
      throw new InvalidTeamspeakChannelException();

    const zone = zones.find(z => z.id === res.zoneId);
    zone.channelConfig = await this.getZoneConfigSafe(serverId, zone.id);

    return zone;
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
      this.serverGroupService.getUserServerGroupsIds(serverId, tsClientDbId),
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
  ): Promise<Zone> {
    const zone = await this.getZoneByUserGroup(serverId, tsClientDbId);
    zone.channelConfig = await this.getZoneConfigSafe(serverId, zone.id);

    return zone;
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
        { relations: ['permissions', 'codec', 'adminGroup'] },
      );

      return config;
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new InvalidConfigurationException(zoneWithoutConfig);
    }
  }
}
