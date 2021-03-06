import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { Client } from './client.entity';
import { SaveClientDto } from './dto/save-client.dto';
import { ClientHistoryRepository } from './client-history.repository';
import { Connection } from 'typeorm';
import { DbErrorCodes } from '../shared/database/codes';
import { clientAlreadyExists } from '../shared/messages/client.messages';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientRepository)
    private clientRepository: ClientRepository,
    @InjectRepository(ClientHistoryRepository)
    private historyRepository: ClientHistoryRepository,
    private connection: Connection,
  ) {}

  async getClientById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if (!client) throw new NotFoundException();

    return client;
  }

  async getServerClientById(
    serverId: number,
    clientId: number,
  ): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { serverId, id: clientId },
    });

    if (!client) throw new NotFoundException();

    return client;
  }

  async getServerClientByTsUid(
    serverId: number,
    tsUniqueId: string,
  ): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { serverId, tsUniqueId },
    });

    if (!client) throw new NotFoundException();

    return client;
  }

  async getServerClientByUserId(
    serverId: number,
    userId: number,
  ): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { serverId, userId },
    });

    if (!client) throw new NotFoundException();

    return client;
  }

  async checkServerClientByUserId(
    serverId: number,
    userId: number,
  ): Promise<boolean> {
    const count = await this.clientRepository.count({
      where: { serverId, userId },
    });

    return count > 0;
  }

  getAllClientsByServerId(serverId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { serverId },
    });
  }

  async saveClient(serverId: number, dto: SaveClientDto): Promise<Client> {
    const { userId, tsUniqueId, tsClientDbId } = dto;

    let client: Client = await this.clientRepository.findOne({
      where: { userId, serverId },
    });

    if (
      client &&
      client.tsUniqueId === tsUniqueId &&
      client.tsClientDbId === tsClientDbId
    )
      return client;

    try {
      let savedClient: Client;

      await this.connection.transaction(async manager => {
        if (!client) {
          client = this.clientRepository.create({
            userId,
            serverId,
            tsUniqueId,
            tsClientDbId,
          });
        } else {
          // push existing data to history
          await this.historyRepository.pushClientToHistory(client, manager);

          client.tsUniqueId = tsUniqueId;
          client.tsClientDbId = tsClientDbId;
        }

        savedClient = await manager.save(client);
      });

      return savedClient;
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(clientAlreadyExists);

      throw e;
    }
  }
}
