import { Connection } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfigRepository } from './channel-config.repository';
import { ChannelConfig } from './channel-config.entity';
import { MetadataService } from '../../../metadata/metadata.service';
import {
  codecDoesNotExist,
  zoneDoesNotExists,
  configAlreadyExists,
  deleteDefaultConfigNotAllowed,
} from '../../../shared/messages/server.messages';
import { ZoneService } from '../zone/zone.service';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { ChannelConfigPermission } from './channel-perm.entity';
import { ChannelConfigPermissionRepository } from './channel-perm.repository';
import { DbErrorCodes } from '../../../shared/database/codes';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

export class ChannelConfigService {
  constructor(
    @InjectRepository(ChannelConfigRepository)
    private configRepository: ChannelConfigRepository,
    @InjectRepository(ChannelConfigPermissionRepository)
    private permRepository: ChannelConfigPermissionRepository,
    private zoneService: ZoneService,
    private refDataService: MetadataService,
    private connection: Connection,
  ) {}

  /**
   * Get all configs by server id
   * @param serverId server id
   */
  getConfigsByServerId(serverId: number): Promise<ChannelConfig[]> {
    return this.configRepository.find({
      where: { serverId },
    });
  }

  /**
   * Get a config by its Id
   * @param params search params
   * @param loadEagerRelations if eager relations should be loaded
   */
  async getConfig(
    params: Partial<ChannelConfig>,
    loadEagerRelations = true,
  ): Promise<ChannelConfig> {
    const config = await this.configRepository.findOne({
      where: params,
      loadEagerRelations,
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  /**
   * Create a config and link permissions
   * @param serverId server id
   * @param dto data to create a config
   */
  async createConfig(
    serverId: number,
    dto: CreateConfigDto,
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

  /**
   * Update a config
   * @param serverId server id
   * @param id config id
   * @param dto data to update
   */
  async updateConfig(
    serverId: number,
    id: number,
    dto: UpdateConfigDto,
  ): Promise<ChannelConfig> {
    const { codecId } = dto;
    if (codecId) await this.validateCodecId(codecId);

    const config = await this.getConfig({ id, serverId });

    Object.assign(config, dto);

    return this.configRepository.save(config);
  }

  /**
   * Set config permissions from the dto
   * @param serverId server id
   * @param configId config id
   * @param dto permissions to set
   */
  async setConfigPermissions(
    serverId: number,
    configId: number,
    dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    await this.getConfig({ id: configId, serverId });

    const permissions = dto.permissions.map(
      p =>
        new ChannelConfigPermission({
          ...p,
          configId,
        }),
    );

    let saved = [];

    await this.connection.transaction(async manager => {
      await manager.delete(ChannelConfigPermission, { configId });

      if (permissions.length > 0) {
        saved = await manager.save(permissions);
      }
    });

    return saved;
  }

  /**
   * Delete a config
   * @param serverId server id
   * @param id config id
   */
  async deleteConfig(serverId: number, id: number): Promise<void> {
    const config = await this.getConfig({ id, serverId });

    if (!config.zoneId)
      throw new BadRequestException(deleteDefaultConfigNotAllowed);

    await this.configRepository.delete(id);
  }

  /**
   * Validate a codec id existence.
   * @param id codec id
   * @throws BadRequestException when the codec doesn't exist
   */
  private async validateCodecId(id: number): Promise<void> {
    const codecExists = await this.refDataService.checkCodecExists(id);

    if (!codecExists) throw new BadRequestException(codecDoesNotExist);
  }

  /**
   * Validate a zone existence for a server
   * @param id codec id
   * @param serverId server id
   * @throws BadRequestException when the zone doesn't exist
   */
  private async validateZoneId(id: number, serverId: number): Promise<void> {
    const zoneExists = await this.zoneService.checkZoneBelongsToServer(
      id,
      serverId,
    );

    if (!zoneExists) throw new BadRequestException(zoneDoesNotExists);
  }
}
