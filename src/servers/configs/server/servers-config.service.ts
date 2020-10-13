import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerConfigRepository } from './server-config.repository';
import { ServerConfig } from './server-config.entity';
import { Server } from '../../server.entity';

@Injectable()
export class ServersConfigService {
  constructor(
    @InjectRepository(ServerConfigRepository)
    private configRepository: ServerConfigRepository,
  ) {}

  /**
   * get all server configs without any connection error from active servers
   * @param id the server id
   */
  async getWorkingConfigs(id: number): Promise<ServerConfig[]> {
    return this.configRepository
      .createQueryBuilder('c')
      .innerJoin(Server, 's', 's.id = c.id')
      .where(
        'c.id = :id AND c.hasConnectionError = false and s.deletedAt IS NULL',
        { id },
      )
      .getMany();
  }

  /**
   * get all server configs IDs without any connection error from active servers
   * @param id the server id
   */
  async getWorkingConfigIds(): Promise<number[]> {
    const configs = await this.configRepository
      .createQueryBuilder('c')
      .select(['c.id'])
      .innerJoin(Server, 's', 's.id = c.id')
      .where('c.hasConnectionError = false and s.deletedAt IS NULL')
      .getMany();

    return configs.map(c => c.id);
  }

  /**
   * get server config
   * @param id the server id
   * @param withServer if server relation should be loaded
   */
  async getServerConfigById(
    id: number,
    withServer = false,
  ): Promise<ServerConfig> {
    const config = await this.configRepository.findOne({
      where: { id },
      relations: withServer ? ['server'] : [],
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  /**
   * Set the connection error flag. If true, will also set hasProblems flag in server entity.
   * @param id
   * @param error
   */
  async setConnectionErrorFlag(id: number, error: boolean): Promise<void> {
    await this.configRepository.update({ id }, { hasConnectionError: error });
  }
}
