import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../channels/dto/channel.dto';

@Injectable()
export class TeamspeakService {
  /**
   * Creates a channel in teamspeak and returns the id
   * Pending implementation
   * @param dto channel data
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createUserChannel(dto: ChannelDto): Promise<number> {
    return Math.floor(Math.random() * 1000) + 1;
  }

  /**
   * Deletes a channel in the voice server
   * @param tsChannelId channel to delete
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteUserChannel(tsChannelId: number): Promise<void> {
    return;
  }
}
