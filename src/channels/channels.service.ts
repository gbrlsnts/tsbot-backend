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
    const { id: clientId } = await this.clientsService.getServerClientByUserId(
      serverId,
      userId,
    );
    const hasChannel = await this.checkClientHasChannel(clientId);

    if (hasChannel) throw new ConflictException(alreadyHasChannel);

    const tsChannelId = await this.tsChannelService.createUserChannel(
      serverId,
      dto,
    );

    const channel = this.channelRepository.create({
      clientId,
      tsChannelId,
    });

    try {
      return this.channelRepository.save(channel);
    } catch (e) {
      await this.tsChannelService.deleteUserChannel(serverId, tsChannelId);
      throw e;
    }
  }

  async deleteChannel(userId: number, id: number): Promise<void> {
    const channel = await this.channelRepository
      .createQueryBuilder('ch')
      .innerJoinAndMapOne('ch.client', Client, 'cl', 'cl.id = ch.clientId')
      .innerJoin(Server, 's', 's.id = cl.serverId')
      .where('ch.id = :id', { id })
      .andWhere('(cl.userId = :userId OR s.ownerId = :userId)', { userId })
      .getOne();

    if (!channel) throw new NotFoundException();

    await this.connection.transaction(async manager => {
      await this.tsChannelService.deleteUserChannel(
        channel.client.serverId,
        channel.tsChannelId,
      );
      await manager.delete(Channel, channel.id);
    });
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
