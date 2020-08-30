/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ChannelDto } from '../channels/dto/channel.dto';
import { ClientProxy } from '@nestjs/microservices';
import { TS_BOT_SERVICE } from '../shared/constants';

@Injectable()
export class UserChannelService {
  private logger = new Logger('UserChannelService');

  constructor(
    @Inject(TS_BOT_SERVICE)
    private client: ClientProxy,
  ) {}

  /**
   * Creates a channel in teamspeak and returns the id
   * Pending implementation
   * @param dto channel data
   */
  async createUserChannel(serverId: number, dto: ChannelDto): Promise<number> {
    const response = this.client.send<{ channel: number }>(
      `bot.server.${serverId}.channel.create`,
      dto,
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
