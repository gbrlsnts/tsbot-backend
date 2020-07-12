import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRepository } from './client.repository';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientRepository)
    private clientRepository: ClientRepository
  ) {}

  async getClientById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if(!client) throw new NotFoundException();

    return client;
  }

  getAllClientsByServerId(serverId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { serverId },
    });
  }

  async createClient(): Promise<Client> {
    return;
  }

  async updateClient(): Promise<Client> {
    return;
  }

}
