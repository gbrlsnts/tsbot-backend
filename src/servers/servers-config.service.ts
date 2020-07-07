import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerConfigRepository } from './server-config.repository';
import { ServerConfig } from './server-config.entity';

@Injectable()
export class ServersConfigService {
  constructor(
    @InjectRepository(ServerConfigRepository)
    private configRepository: ServerConfigRepository,
  ) {}

  /**
   * get server config
   * @param id the server id
   */
  async getServerConfigById(id: number): Promise<ServerConfig> {
    const config = await this.configRepository.findOne({
      where: { id }
    });

    if (!config) throw new NotFoundException();

    return config;
  }
}
