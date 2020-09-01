import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChannelDto } from '../channels/dto/channel.dto';
import { TS_BOT_SERVICE } from '../shared/constants';
import { ChannelConfigService } from '../servers/configs/channel/channel-config.service';
import {
  CreateChannelData,
  CreateUserChannelResultData,
  DeleteChannelData,
} from './types/user-channel';
import { ZoneService } from '../servers/configs/zone/zone.service';
import { subchannelsExceedMax } from '../shared/messages/channel.messages';
import { createChannelSubject, deleteChannelSubject } from './subjects';

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
   * @param dto channel data
   */
  async createUserChannel(serverId: number, dto: ChannelDto): Promise<number> {
    const channelConfig = await this.channelConfigService.getConfig({
      serverId,
      zoneId: null,
    });

    if (dto.subchannels.length > channelConfig.allowedSubChannels)
      throw new BadRequestException(subchannelsExceedMax);

    const zone = await this.zoneService.getZone({ serverId, isDefault: true });

    const data: CreateChannelData = {
      channels: [dto.toBotChannel()],
      zone: zone.toBotData(),
      permissions: channelConfig.toBotPermissions(),
      properties: {
        audio: channelConfig.toBotAudio(),
      },
    };

    const response = this.client.send<CreateUserChannelResultData>(
      createChannelSubject(serverId),
      data,
    );

    const result = await response.toPromise();

    return result.channel;
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
}
