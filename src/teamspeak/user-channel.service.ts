/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChannelDto } from '../channels/dto/channel.dto';
import { TS_BOT_SERVICE } from '../shared/constants';
import { ChannelConfigService } from '../servers/configs/channel/channel-config.service';
import { BotCodec } from './types/channel';
import { CreateChannelData } from './types/user-channel';
import { ZoneService } from '../servers/configs/zone/zone.service';

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

    const zone = await this.zoneService.getZone({ serverId, isDefault: true });

    const data: CreateChannelData = {
      zone: {
        start: zone.channelIdStart,
        end: zone.channelIdEnd,
        separators: zone.separator,
      },
      channels: [
        {
          name: dto.name,
          channels: [{ name: dto.name, password: dto.password, channels: [] }],
        },
      ],
      permissions: channelConfig.permissions.map(perm => ({
        permission: perm.permission.permid,
        value: perm.value,
      })),
      properties: {
        audio: {
          codec: BotCodec[channelConfig.codec.code],
          quality: channelConfig.codecQuality,
        },
      },
    };

    const response = this.client.send<{ channel: number }>(
      `bot.server.${serverId}.channel.create`,
      data,
    );

    const result = await response.toPromise();

    return result.channel;
  }

  /**
   * Deletes a channel in the voice server
   * @param tsChannelId channel to delete
   */
  async deleteUserChannel(
    serverId: number,
    tsChannelId: number,
  ): Promise<void> {
    return;
  }
}
