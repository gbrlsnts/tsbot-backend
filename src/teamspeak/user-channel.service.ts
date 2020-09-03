import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChannelDto } from '../channels/dto/channel.dto';
import { SubChannelDto } from 'src/channels/dto/sub-channel.dto';
import { TS_BOT_SERVICE } from '../shared/constants';
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
} from './subjects';
import { ChannelConfig } from 'src/servers/configs/channel/channel-config.entity';
import { Zone } from 'src/servers/configs/zone/zone.entity';
import { createSubChannelSubject } from './subjects';
import { ValidateChannelUniqueRequest } from './types/channel';

@Injectable()
export class UserChannelService {
  constructor(
    @Inject(TS_BOT_SERVICE)
    private client: ClientProxy,
    private channelConfigService: ChannelConfigService,
    private zoneService: ZoneService,
  ) {}

  /**
   * Creates a channel in teamspeak and returns the id
   * Pending implementation
   * @param serverId server id to create the channel
   * @param dto channel data
   */
  async createUserChannel(serverId: number, dto: ChannelDto): Promise<number> {
    const [isUnique, channelConfig, zone] = await Promise.all([
      this.sendIsUniqueRequest(serverId, [dto.name]),
      this.channelConfigService.getConfig({
        serverId,
        zoneId: null,
      }),
      this.zoneService.getZone({ serverId, isDefault: true }),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (dto.subchannels.length > channelConfig.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(channelConfig, zone, dto);

    const response = this.client.send<CreateUserChannelResultData>(
      createChannelSubject(serverId),
      data,
    );

    const result = await response.toPromise();

    return result.channel;
  }

  /**
   * Creates a sub channel in teamspeak and returns the id
   * Pending implementation
   * @param serverId server id to create the sub channel
   * @param tsChannelId teamspeak id of the parent channel
   * @param dto channel data
   */
  async createUserSubChannel(
    serverId: number,
    tsChannelId: number,
    dto: SubChannelDto,
  ): Promise<void> {
    const [isUnique, subChannelCount, channelConfig, zone] = await Promise.all([
      this.sendIsUniqueRequest(serverId, dto.subchannels, tsChannelId),
      this.client
        .send<number>(getSubChannelCountSubject(serverId), {
          channelId: tsChannelId,
        })
        .toPromise(),
      this.channelConfigService.getConfig({
        serverId,
        zoneId: null,
      }),
      this.zoneService.getZone({ serverId, isDefault: true }),
    ]);

    if (!isUnique) throw new BadRequestException(channelNameAlreadyExists);

    if (
      subChannelCount + dto.subchannels.length >
      channelConfig.allowedSubChannels
    )
      throw new BadRequestException(subchannelsExceedMax);

    const data = await this.buildChannelCreatePayload(
      channelConfig,
      zone,
      dto,
      tsChannelId,
    );

    await this.client.send(createSubChannelSubject(serverId), data).toPromise();
  }

  /**
   * Deletes a channel in the voice server
   * @param tsChannelId channel to delete
   * @param tsRootChannelId when the channel to delete is a sub channel id, this should be the root/top channel id.
   *        the root channel is also the id stored in the channel entity
   */
  async deleteUserChannel(
    serverId: number,
    tsChannelId: number,
    tsRootChannelId?: number,
  ): Promise<void> {
    const zone = await this.zoneService.getZone({ serverId, isDefault: true });

    const data: DeleteChannelData = {
      zone: zone.toBotData(),
      channelId: tsChannelId,
      rootChannelId: tsRootChannelId,
    };

    const response = this.client.send<boolean>(
      deleteChannelSubject(serverId),
      data,
    );

    await response.toPromise();
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

    return this.client
      .send<boolean>(getChannelIsUniqueSubject(serverId), isUniqueRequestData)
      .toPromise();
  }
}
