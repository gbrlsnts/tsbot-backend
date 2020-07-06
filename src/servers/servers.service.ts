import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerRepository } from './server.repository';
import { Server } from './server.entity';
import { User } from '../users/user.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { ServerConfigRepository } from './server-config.repository';

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

  /**
   * Create a server and its configuration
   * @param user user that will own the server
   * @param dto data to persist
   */
  async createServer(user: User, dto: CreateServerDto): Promise<Server> {
    let server = this.serverRepository.create();

    server.name = dto.name;
    server.owner = user;
    server = await this.serverRepository.save(server);

    let serverConfig = this.configRepository.create();

    serverConfig.server = server;
    serverConfig.config = {
      host: dto.host,
      serverPort: dto.serverPort,
      queryPort: dto.queryPort,
      botName: dto.botName,
      protocol: dto.protocol,
      username: dto.username,
      password: dto.password,
    };

    serverConfig = await this.configRepository.save(serverConfig);

    delete serverConfig.config.password;
    server.config = serverConfig;

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
}
