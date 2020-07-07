import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerRepository } from './server.repository';
import { Server } from './server.entity';
import { User } from '../users/user.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { ServerConfigRepository } from './server-config.repository';
import { serverNameExists } from '../messages/server.messages';
import { ServerConfig } from './server-config.entity';

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
   */
  getServers(): Promise<Server[]> {
    return this.serverRepository.find();
  }

  /**
   * Get a server by the id
   * @param id the server id
   * @throws NotFoundException
   */
  async getServerById(id: number): Promise<Server> {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException();

    return server;
  }

  async getServerConfigById(id: number): Promise<ServerConfig> {
    const config = await this.configRepository.findOne({
      where: { id }
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  /**
   * Create a server and its configuration
   * @param user user that will own the server
   * @param dto data to persist
   */
  async createServer(user: User, dto: CreateServerDto): Promise<Server> {
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

    await this.configRepository.save(serverConfig);

    return server;
  }

  /**
   * Update a server properties
   */
  updateServer(): Promise<Server> {
    return;
  }

  /**
   * Delete a server by the id
   * @param id the server id
   * @throws NotFoundException
   */
  async deleteServer(id: number): Promise<void> {
    const result = await this.serverRepository.softDelete(id);

    if (result.affected == 0) throw new NotFoundException();
  }

  /**
   * Checks if a user already has a server with a given name
   * @param userId the user id to check
   * @param serverName the server name to check
   */
  async checkServerExistsByUser(userId: number, serverName: string): Promise<boolean>
  {
    const count = await this.serverRepository.count({
      where: {
        name: serverName,
        ownerId: userId,
      }
    });

    return count > 0;
  }
}
