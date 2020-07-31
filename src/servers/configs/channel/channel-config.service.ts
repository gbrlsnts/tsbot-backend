import { getConnection } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfigRepository } from './channel-config.repository';
import { ChannelConfig } from './channel-config.entity';
import { ChannelConfigDto } from './dto/channel-config.dto';
import { ServerRefDataService } from '../../../server-ref-data/server-ref-data.service';
import {
  codecDoesNotExist,
  zoneDoesNotExists,
  configAlreadyExists,
} from '../../../shared/messages/server.messages';
import { ZoneService } from '../zone/zone/zone.service';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { ChannelConfigPermission } from './channel-perm.entity';
import { ChannelConfigPermissionRepository } from './channel-perm.repository';
import { DbErrorCodes } from '../../../shared/database/codes';

export class ChannelConfigService {
  constructor(
    @InjectRepository(ChannelConfigRepository)
    private configRepository: ChannelConfigRepository,
    @InjectRepository(ChannelConfigPermissionRepository)
    private permRepository: ChannelConfigPermissionRepository,
    private zoneService: ZoneService,
    private refDataService: ServerRefDataService,
  ) {}

  getConfigsByServerId(serverId: number): Promise<ChannelConfig[]> {
    return this.configRepository.find({
      where: { serverId },
    });
  }

  async getConfigById(id: number): Promise<ChannelConfig> {
    const config = await this.configRepository.findOne({
      where: { id },
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  async getServerConfigById(
    serverId: number,
    id: number,
  ): Promise<ChannelConfig> {
    const config = await this.configRepository.findOne({
      where: { serverId, id },
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  async createConfig(
    serverId: number,
    dto: ChannelConfigDto,
  ): Promise<ChannelConfig> {
    const { codecId, zoneId } = dto;

    await this.validateCodecId(codecId);
    if (zoneId) await this.validateZoneId(zoneId, serverId);

    const config = this.configRepository.create({
      serverId,
      ...dto,
    });

    try {
      return await this.configRepository.save(config);
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(configAlreadyExists);

      throw e;
    }
  }

  async updateConfig(
    id: number,
    dto: ChannelConfigDto,
  ): Promise<ChannelConfig> {
    const { codecId } = dto;

    const config = await this.getConfigById(id);

    if (codecId) await this.validateCodecId(codecId);

    Object.assign(config, dto);

    return this.configRepository.save(config);
  }

  async setConfigPermissions(
    configId: number,
    dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    const permissions = dto.permissions.map(p => ({
      ...p,
      configId,
    }));

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.permRepository.delete({ configId });

      let saved = [];

      if(permissions.length > 0) {
        saved = await this.permRepository.save(permissions, {
          transaction: false,
        });
      }

      await queryRunner.commitTransaction();

      return saved;
    } catch (e) {
      queryRunner.rollbackTransaction();

      throw e;
    }
  }

  async deleteConfig(id: number): Promise<void> {
    const result = await this.configRepository.delete(id);

    if (result.affected == 0) throw new NotFoundException();
  }

  private async validateCodecId(id: number): Promise<void> {
    const codecExists = await this.refDataService.checkCodecExists(id);

    if (!codecExists) throw new BadRequestException(codecDoesNotExist);
  }

  private async validateZoneId(id: number, serverId: number): Promise<void> {
    const zoneExists = await this.zoneService.checkZoneBelongsToServer(
      id,
      serverId,
    );

    if (!zoneExists) throw new BadRequestException(zoneDoesNotExists);
  }
}
