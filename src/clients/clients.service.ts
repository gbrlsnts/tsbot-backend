import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { Client } from './client.entity';
import { SaveClientDto } from './dto/save-client.dto';
import { ClientHistoryRepository } from './client-history.repository';
import { getConnection } from 'typeorm';
import { DbErrorCodes } from '../shared/database/codes';
import { clientAlreadyExists } from '../shared/messages/client.messages';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientRepository)
    private clientRepository: ClientRepository,
    @InjectRepository(ClientHistoryRepository)
    private historyRepository: ClientHistoryRepository,
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

  async saveClient(
    userId: number,
    serverId: number,
    dto: SaveClientDto,
  ): Promise<Client> {
    const { tsUniqueId, tsClientDbId } = dto;

    let client: Client = await this.clientRepository.findOne({
      where: { userId, serverId },
    });

    if (
      client &&
      client.tsUniqueId === tsUniqueId &&
      client.tsClientDbId === tsClientDbId
    )
      return client;

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!client) {
        client = this.clientRepository.create({
          userId,
          serverId,
          tsUniqueId,
          tsClientDbId,
        });
      } else {
        // push existing data to history
        await this.historyRepository.pushClientToHistory(client, false);

        client.tsUniqueId = tsUniqueId;
        client.tsClientDbId = tsClientDbId;
      }

      const savedClient = await this.clientRepository.save(client, {
        transaction: false,
      });
      await queryRunner.commitTransaction();

      return savedClient;
    } catch (e) {
      await queryRunner.rollbackTransaction();

      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(clientAlreadyExists);

      throw new InternalServerErrorException();
    }
  }
}
