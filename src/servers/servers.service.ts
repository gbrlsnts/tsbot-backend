import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerRepository } from './server.repository';
import { Server } from './server.entity';
import { User } from '../users/user.entity';
import { ServerDto } from './dto/server.dto';
import { ServerConfigRepository } from './configs/server/server-config.repository';
import { serverNameExists } from '../shared/messages/server.messages';
import { ServerConfigDto } from './dto/config.dto';
import { IsNull } from 'typeorm';
import { UpdateServerDto } from './dto/update-server.dto';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(ServerRepository)
    private serverRepository: ServerRepository,
    @InjectRepository(ServerConfigRepository)
    private configRepository: ServerConfigRepository,
  ) {}

  /**
   * Get all servers
   * @param withDeleted indicates if deleted servers should be included
   */
  getServers(withDeleted = false): Promise<Server[]> {
    return this.serverRepository.find({
      withDeleted,
    });
  }

  /**
   * Get a server by the id
   * @param id the server id
   * @param withConfig if config should be included
   * @throws NotFoundException
   */
  async getServerById(id: number): Promise<Server> {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException();

    return server;
  }

  /**
   * Get a server by the id
   * @param id the server id
   * @param withConfig if config should be included
   * @throws NotFoundException
   */
  async getServerWithConfigById(id: number): Promise<Server> {
    const server = await this.serverRepository.find({
      where: { id },
      relations: ['config'],
      take: 1,
    });

    if (server.length === 0) throw new NotFoundException();

    return server[0];
  }

  /**
   * Create a server and its configuration
   * @param user user that will own the server
   * @param dto data to persist
   */
  async createServer(user: User, dto: ServerDto): Promise<Server> {
    const exists = await this.checkServerExistsByUser(user.id, dto.serverName);

    if (exists) throw new ConflictException(serverNameExists);

    let server = this.serverRepository.create({
      name: dto.serverName,
      ownerId: user.id,
    });

    server = await this.serverRepository.save(server);

    const serverConfig = this.configRepository.create({
      id: server.id,
      config: {
        host: dto.host,
        serverPort: dto.serverPort,
        queryPort: dto.queryPort,
        botName: dto.botName,
        protocol: dto.protocol,
        username: dto.username,
        password: dto.password,
      },
    });

    const created = await this.serverRepository.saveTransactionServerAndConfig(
      server,
      serverConfig,
    );

    delete created.config;

    return created;
  }

  /**
   * Update a server and it's config
   * @param id server id
   * @param dto dto with the update data
   */
  async updateServer(id: number, dto: UpdateServerDto): Promise<Server> {
    const server = await this.getServerWithConfigById(id);

    if (server.name !== dto.serverName) {
      const exists = await this.checkServerExistsByUser(
        server.ownerId,
        dto.serverName,
      );
      if (exists) throw new ConflictException(serverNameExists);

      server.name = dto.serverName;
    }

    const updatedConfigDto = new ServerConfigDto(dto);
    server.config.config = server.config.config.merge(updatedConfigDto);

    return await this.serverRepository.saveTransactionServerAndConfig(
      server,
      server.config,
    );
  }

  /**
   * Delete a server by the id
   * @param id the server id
   * @throws NotFoundException
   */
  async deleteServer(id: number): Promise<void> {
    const result = await this.serverRepository.softDelete({
      id,
      deletedAt: IsNull(),
    });

    if (result.affected == 0) throw new NotFoundException();
  }

  /**
   * Checks if a user already has a server with a given name
   * @param userId the user id to check
   * @param serverName the server name to check
   */
  async checkServerExistsByUser(
    userId: number,
    serverName: string,
  ): Promise<boolean> {
    const count = await this.serverRepository.count({
      where: {
        name: serverName,
        ownerId: userId,
      },
    });

    return count > 0;
  }
}
