import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelRepository } from './channel.repository';
import { Channel } from './channel.entity';
import { Client } from '../clients/client.entity';
import { ChannelDto } from './dto/channel.dto';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(ChannelRepository)
        private channelRepository: ChannelRepository,
        private clientsService: ClientsService,
    ) {}

    getChannelsByServerId(serverId: number): Promise<Channel[]> {
        return this.channelRepository
            .createQueryBuilder('ch')
            .innerJoin(Client, 'cl')
            .where('cl.serverId = :serverId', { serverId })
            .getMany();
    }

    getChannelByServerId(id: number, serverId: number): Promise<Channel> {
        const channel =  this.channelRepository
        .createQueryBuilder('ch')
        .innerJoin(Client, 'cl')
        .where('ch.id = :id', { id })
        .andWhere('cl.serverId = :serverId', { serverId })
        .getOne();

        if(!channel) throw new NotFoundException();

        return channel;
    }

    async createChannel(userId: number, serverId: number, dto: ChannelDto): Promise<Channel> {
        const client = await this.clientsService.getServerClientByUserId(serverId, userId);

        // todo: create channel in teamspeak, returning ch id

        const channel = this.channelRepository.create({
            clientId: client.id,
            tsChannelId: Math.floor(Math.random() * 1000) + 1, // temp, until there's no connection to teamspeak
        });

        return this.channelRepository.save(channel);
    }

    async deleteChannel(userId: number, id: number): Promise<void> {
        const chQuery = this.channelRepository
            .createQueryBuilder('c')
            .select('c.id')
            .innerJoin(Client, 'cl')
            .where('c.id = :id', { id })
            .andWhere('cl.userId = :userId', { userId });

        const result = await this.channelRepository
            .createQueryBuilder('ch')
            .delete()
            .where(`ch.id IN (${chQuery.getQuery()})`)
            .setParameters(chQuery.getParameters())
            .execute();

        if(result.affected > 0) throw new NotFoundException();
    }
}