import { ChannelConfigRepository } from './channel-config.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfig } from './channel-config.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChannelConfigDto } from './dto/channel-config.dto';
import { ServerRefDataService } from '../../../server-ref-data/server-ref-data.service';
import { codecDoesNotExist, zoneDoesNotExists } from '../../../shared/messages/server.messages';
import { ZoneService } from '../zone/zone/zone.service';
import { AddPermissionsDto } from './dto/add-permissions.dto';
import { ChannelConfigPermission } from './channel-perm.entity';
import { ChannelConfigPermissionRepository } from './channel-perm.repository';

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

    if(!config) throw new NotFoundException();

    return config;
  }

  async getServerConfigById(serverId: number, id: number): Promise<ChannelConfig> {
    const config = await this.configRepository.findOne({
      where: { serverId, id },
    });

    if(!config) throw new NotFoundException();

    return config;
  }

  async createConfig(serverId: number, dto: ChannelConfigDto): Promise<ChannelConfig> {
    const { codecId, zoneId } = dto;

    await this.validateCodecId(codecId);
    if(zoneId) await this.validateZoneId(zoneId, serverId);

    const config = this.configRepository.create({
      serverId,
      ...dto,
    });
    // todo: handle permissions duplicate or dont exist
    return this.configRepository.save(config);
  }

  async updateConfig(id: number, dto: ChannelConfigDto): Promise<ChannelConfig> {
    const { codecId, allowedSubChannels, codecQuality } = dto;

    const config = await this.getConfigById(id);

    if(codecId) await this.validateCodecId(codecId);

    config.allowedSubChannels = allowedSubChannels;
    config.codecId = codecId;
    config.codecQuality = codecQuality;

    return this.configRepository.save(config);
  }

  addConfigPermissions(configId: number, dto: AddPermissionsDto): Promise<ChannelConfigPermission[]> {
    // todo: check for conflicts
    const permissions = dto.permissions.map(p => ({
      ...p,
      configId,
    }));

    return this.permRepository.save(permissions);
  }

  async removeConfigPermissions(perms: number[]): Promise<number> {
    const result = await this.permRepository.delete(perms);

    if (result.affected == 0) throw new NotFoundException();

    return result.affected;
  }

  async deleteConfig(id: number): Promise<void> {
    const result = await this.configRepository.delete(id);

    if (result.affected == 0) throw new NotFoundException();
  }

  private async validateCodecId(id: number): Promise<void> {
    const codecExists = await this.refDataService.checkCodecExists(id);

    if(!codecExists) throw new BadRequestException(codecDoesNotExist);
  }

  private async validateZoneId(id: number, serverId: number): Promise<void> {
    const zoneExists = await this.zoneService.checkZoneBelongsToServer(id, serverId);

    if(!zoneExists) throw new BadRequestException(zoneDoesNotExists);
  }
}
