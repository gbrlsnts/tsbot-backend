import { getConnection } from 'typeorm';
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
   * @param id config id
   * @param loadEagerRelations if eager relations should be loaded
   */
  async getConfigById(
    id: number,
    loadEagerRelations = true,
  ): Promise<ChannelConfig> {
    const config = await this.configRepository.findOne({
      where: { id },
      loadEagerRelations,
    });

    if (!config) throw new NotFoundException();

    return config;
  }

  /**
   * Get a config by server
   * @param serverId server id
   * @param id config id
   */
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
   * @param id config id
   * @param dto data to update
   */
  async updateConfig(id: number, dto: UpdateConfigDto): Promise<ChannelConfig> {
    const { codecId } = dto;
    if (codecId) await this.validateCodecId(codecId);

    const config = await this.getConfigById(id, false);

    Object.assign(config, dto);

    return this.configRepository.save(config);
  }

  /**
   * Set config permissions from the dto
   * @param configId config id
   * @param dto permissions to set
   */
  async setConfigPermissions(
    configId: number,
    dto: SetPermissionsDto,
  ): Promise<ChannelConfigPermission[]> {
    await this.getConfigById(configId, false);

    const permissions = dto.permissions.map(
      p =>
        new ChannelConfigPermission({
          ...p,
          configId,
        }),
    );

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.permRepository.delete({ configId });

      let saved = [];

      if (permissions.length > 0) {
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

  /**
   * Delete a config
   * @param id config id
   */
  async deleteConfig(id: number): Promise<void> {
    const config = await this.getConfigById(id);

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
