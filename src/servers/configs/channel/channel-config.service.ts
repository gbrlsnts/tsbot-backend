import { ChannelConfigRepository } from './channel-config.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelConfig } from './channel-config.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChannelConfigDto } from './dto/channel-config.dto';
import { ServerRefDataService } from '../../../server-ref-data/server-ref-data.service';
import { codecDoesNotExist, zoneDoesNotExists } from '../../../shared/messages/server.messages';
import { ZoneService } from '../zone/zone/zone.service';

export class ChannelConfigService {
  constructor(
    @InjectRepository(ChannelConfigRepository)
    private configRepository: ChannelConfigRepository,
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

  async createConfig(userId: number, serverId: number, dto: ChannelConfigDto): Promise<ChannelConfig> {
    const { codecId, zoneId } = dto;

    await this.validateCodecId(codecId);
    if(zoneId) await this.validateZoneId(zoneId, userId);

    const config = this.configRepository.create({
      serverId,
      ...dto,
    });

    return this.configRepository.save(config);
  }

  //async updateConfig() {}

  async deleteConfig(id: number): Promise<void> {
    const result = await this.configRepository.delete(id);

    if (result.affected == 0) throw new NotFoundException();
  }

  private async validateCodecId(id: number): Promise<void> {
    const codecExists = await this.refDataService.checkCodecExists(id);

    if(!codecExists) throw new BadRequestException(codecDoesNotExist);
  }

  private async validateZoneId(id: number, userId: number): Promise<void> {
    const zoneExists = await this.zoneService.checkZoneExistsByUserId(id, userId);

    if(!zoneExists) throw new BadRequestException(zoneDoesNotExists);
  }
}
