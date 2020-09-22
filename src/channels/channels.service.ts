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
import { UserChannelService } from '../teamspeak/user-channel.service';
import { alreadyHasChannel } from '../shared/messages/channel.messages';
import { Server } from '../servers/server.entity';
import { FindChannelOptions } from './channel.types';
import { SubChannelDto } from './dto/sub-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(ChannelRepository)
    private channelRepository: ChannelRepository,
    private clientsService: ClientsService,
    private tsChannelService: UserChannelService,
    private connection: Connection,
  ) {}

  getChannelsByServerId(serverId: number): Promise<Channel[]> {
    return this.channelRepository
      .createQueryBuilder('ch')
      .innerJoin(Client, 'cl', 'cl.id = ch.clientId')
      .where('cl.serverId = :serverId', { serverId })
      .getMany();
  }

  async getChannelByServerId(id: number, serverId: number): Promise<Channel> {
    const channel = await this.channelRepository
      .createQueryBuilder('ch')
      .innerJoin(Client, 'cl', 'cl.id = ch.clientId')
      .where('ch.id = :id', { id })
      .andWhere('cl.serverId = :serverId', { serverId })
      .getOne();

    if (!channel) throw new NotFoundException();

    return channel;
  }

  async getChannelById(
    id: number,
    options?: FindChannelOptions,
  ): Promise<Channel> {
    const { relations } = options;

    const channel = await this.channelRepository.findOne({
      where: { id },
      relations,
    });

    if (!channel) throw new NotFoundException();

    return channel;
  }

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

    const tsChannelId = await this.tsChannelService.createUserChannel(
      serverId,
      tsClientDbId,
      dto,
    );

    const channel = this.channelRepository.create({
      clientId,
      tsChannelId,
    });

    try {
      return this.channelRepository.save(channel);
    } catch (e) {
      await this.tsChannelService.deleteUserChannel(
        serverId,
        tsClientDbId,
        tsChannelId,
      );
      throw e;
    }
  }

  async createSubChannel(channelId: number, dto: SubChannelDto): Promise<void> {
    const channel = await this.getChannelById(channelId, {
      relations: ['client'],
    });

    await this.tsChannelService.createUserSubChannel(
      channel.client.serverId,
      channel.tsChannelId,
      channel.client.tsClientDbId,
      dto,
    );
  }

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
      .where('s.id = :serverId AND ch.id = :id', { serverId, id })
      .andWhere('(cl.userId = :userId OR s.ownerId = :userId)', { userId })
      .getOne();

    if (!channel) throw new NotFoundException();

    // we want to delete the sub channel
    if (tsSubChannelId) {
      await this.tsChannelService.deleteUserChannel(
        channel.client.serverId,
        channel.client.tsClientDbId,
        tsSubChannelId,
        channel.tsChannelId,
      );
    } else {
      await this.connection.transaction(async manager => {
        await this.tsChannelService.deleteUserChannel(
          channel.client.serverId,
          channel.client.tsClientDbId,
          channel.tsChannelId,
        );
        await manager.delete(Channel, channel.id);
      });
    }
  }

  async checkClientHasChannel(clientId: number): Promise<boolean> {
    const count = await this.channelRepository.count({
      where: { clientId },
    });

    return count > 0;
  }

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
