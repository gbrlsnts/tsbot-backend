import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { Client } from './client.entity';
import { SaveClientDto } from './dto/save-client.dto';
import { ClientHistoryRepository } from './client-history.repository';
import { ClientHistory } from './client-history.entity';

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
    let client: Client = await this.clientRepository.findOne({
      where: { userId, serverId },
    });

    if (!client) {
      client = this.clientRepository.create({
        userId,
        serverId,
        tsUniqueId: dto.tsUniqueId,
        tsClientDbId: dto.tsClientDbId,
      });
    } else {
      // push existing data to history
      await this.historyRepository.save(ClientHistory.fromClient(client));

      client.tsUniqueId = dto.tsUniqueId;
      client.tsClientDbId = dto.tsClientDbId;
    }

    return this.clientRepository.save(client);
  }
}
