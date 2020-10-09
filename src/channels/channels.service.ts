import { Connection } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelRepository } from './channel.repository';
import { Channel } from './channel.entity';
import { Client } from '../clients/client.entity';
import { ChannelDto } from './dto/channel.dto';
import { ClientsService } from '../clients/clients.service';
import { alreadyHasChannel } from '../shared/messages/channel.messages';
import { Server } from '../servers/server.entity';
import { FindChannelOptions } from './channel.types';
import { SubChannelDto } from './dto/sub-channel.dto';
import { UserChannelService } from './user-channel.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ChannelsService {
  logger = new Logger('ChannelsService');

  constructor(
    @InjectRepository(ChannelRepository)
    private channelRepository: ChannelRepository,
    private clientsService: ClientsService,
    private userChannelService: UserChannelService,
    private connection: Connection,
  ) {}

  /**
   * Get all channels by server id
   * @param serverId
   */
  getChannelsByServerId(serverId: number): Promise<Channel[]> {
    return this.channelRepository.find({
      where: { serverId },
    });
  }

  /**
   * Get a channel in a server
   * @param id
   * @param serverId
   */
  async getChannel(
    params: Partial<Channel>,
    options?: FindChannelOptions,
  ): Promise<Channel> {
    const { relations } = options;

    const channel = await this.channelRepository.findOne({
      where: params,
      relations,
    });

    if (!channel) throw new NotFoundException();

    return channel;
  }

  /**
   * Get the logged user channel in a server
   * @param userId
   * @param serverId
   */
  async getUserChannel(userId: number, serverId: number): Promise<Channel> {
    const channel = await this.channelRepository
      .createQueryBuilder('ch')
      .innerJoin(Client, 'cl', 'cl.id = ch.clientId')
      .where('cl.userId = :userId', { userId })
      .andWhere('ch.serverId = :serverId and cl.serverId = :serverId', {
        serverId,
      })
      .getOne();

    if (!channel) throw new NotFoundException();

    return channel;
  }

  /**
   * Create a channel
   * @param userId user that will be linked to the channel
   * @param serverId
   * @param dto data
   */
  async createChannel(
    userId: number,
    serverId: number,
    dto: ChannelDto,
  ): Promise<Channel> {
    const {
      id: clientId,
      tsClientDbId,
    } = await this.clientsService.getServerClientByUserId(serverId, userId);
    const hasChannel = await this.checkClientHasChannel(clientId);

    if (hasChannel) throw new ConflictException(alreadyHasChannel);

    const tsChannelId = await this.userChannelService.createUserChannel(
      serverId,
      tsClientDbId,
      dto,
    );

    const channel = this.channelRepository.create({
      serverId,
      clientId,
      tsChannelId,
    });

    try {
      return await this.channelRepository.save(channel);
    } catch (e) {
      this.userChannelService
        .deleteUserChannel(serverId, tsChannelId)
        .catch(e =>
          this.logger.error('error deleting channel after exception', e?.stack),
        );

      throw e;
    }
  }

  /**
   * Create a sub channel in teamspeak
   * @param channelId db channel to create a sub channel for
   * @param serverId
   * @param dto data
   */
  async createSubChannel(
    channelId: number,
    serverId: number,
    dto: SubChannelDto,
  ): Promise<void> {
    const channel = await this.getChannel(
      { id: channelId, serverId },
      {
        relations: ['client'],
      },
    );

    await this.userChannelService.createUserSubChannel(
      channel.client.serverId,
      channel.tsChannelId,
      channel.client.tsClientDbId,
      dto,
    );
  }

  /**
   * Delete a channel or sub channel
   * @param userId
   * @param serverId
   * @param id db channel id
   * @param tsSubChannelId if deleting a subchannel, provide the ID here (ts3 id)
   */
  async deleteChannel(
    userId: number,
    serverId: number,
    id: number,
    tsSubChannelId?: number,
  ): Promise<void> {
    const channel = await this.channelRepository
      .createQueryBuilder('ch')
      .innerJoinAndMapOne('ch.client', Client, 'cl', 'cl.id = ch.clientId')
      .innerJoin(Server, 's', 's.id = cl.serverId')
      .where('ch.serverId = :serverId AND s.id = :serverId AND ch.id = :id', {
        serverId,
        id,
      })
      .andWhere('(cl.userId = :userId OR s.ownerId = :userId)', { userId })
      .getOne();

    if (!channel) throw new NotFoundException();

    // we want to delete the sub channel
    if (tsSubChannelId) {
      await this.userChannelService.deleteUserChannel(
        channel.client.serverId,
        tsSubChannelId,
        channel.tsChannelId,
      );
    } else {
      await this.connection.transaction(async manager => {
        await this.userChannelService.deleteUserChannel(
          channel.client.serverId,

          channel.tsChannelId,
        );
        await manager.delete(Channel, channel.id);
      });
    }
  }

  /**
   * Check if a client has a channel
   * @param clientId
   */
  async checkClientHasChannel(clientId: number): Promise<boolean> {
    const count = await this.channelRepository.count({
      where: { clientId },
    });

    return count > 0;
  }

  /**
   * Check if the client either owns the channel or server
   * @param userId
   * @param id
   */
  async checkUserOwnsChannelOrServer(
    userId: number,
    id: number,
  ): Promise<boolean> {
    const count = await this.channelRepository
      .createQueryBuilder('ch')
      .innerJoin(Client, 'cl', 'cl.id = ch.clientId')
      .innerJoin(Server, 's', 's.id = cl.serverId')
      .where('ch.id = :id', { id })
      .andWhere('(cl.userId = :userId OR s.ownerId = :userId)', { userId })
      .getCount();

    return count === 1;
  }
}
