import { ZoneRepository } from './zone.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from './zone.entity';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { propLessThanAnother } from '../../../shared/messages/global.messages';
import { CreateZoneDto } from './dto/create-zone.dto';
import { Connection } from 'typeorm';
import { zoneCantUnsetDefault } from '../../../shared/messages/server.messages';

export class ZoneService {
  constructor(
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
    private connection: Connection,
  ) {}

  /**
   * Get all zones
   */
  getAllZones(): Promise<Zone[]> {
    return this.zoneRepository.find();
  }

  /**
   * Get all zones by server id
   * @param serverId
   */
  getAllZonesByServer(serverId: number): Promise<Zone[]> {
    return this.zoneRepository.find({
      where: { serverId },
    });
  }

  /**
   * Get a zone by id
   * @param params zone search params
   */
  async getZone(params: Partial<Zone>): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({
      where: params,
    });

    if (!zone) throw new NotFoundException();

    return zone;
  }

  /**
   * Create a zone
   * @param serverId server id
   * @param dto zone data
   */
  async createZone(serverId: number, dto: CreateZoneDto): Promise<Zone> {
    const { name, isDefault } = dto;
    await this.validateZoneName(name, serverId);

    if (!isDefault) {
      const defaultZonesExist = await this.checkZoneExists({
        serverId,
        isDefault: true,
      });

      if (!defaultZonesExist) dto.isDefault = true;
    }

    const zone = this.zoneRepository.create({
      serverId,
      ...dto,
    });

    let savedZone: Zone;
    await this.connection.transaction(async manager => {
      savedZone = await this.zoneRepository.saveAndSetDefaults(zone, manager);
    });

    return savedZone;
  }

  /**
   * Update a zone
   * @param id zone id
   * @param dto zone data
   */
  async updateZone(id: number, dto: UpdateZoneDto): Promise<Zone> {
    const {
      name: newName,
      minutesInactiveNotify: newMinutesNotify,
      minutesInactiveDelete: newMinutesDelete,
    } = dto;
    const zone = await this.getZone({ id });

    if (zone.name !== newName)
      await this.validateZoneName(newName, zone.serverId);

    if (
      dto.isDefault !== undefined &&
      dto.isDefault === false &&
      zone.isDefault
    )
      throw new BadRequestException(zoneCantUnsetDefault);

    this.validateInactiveMinutes(
      zone,
      dto.crawl,
      newMinutesNotify,
      newMinutesDelete,
    );

    Object.assign(zone, dto);

    let savedZone: Zone;
    await this.connection.transaction(async manager => {
      savedZone = await this.zoneRepository.saveAndSetDefaults(zone, manager);
    });

    return savedZone;
  }

  /**
   * Delete a zone by id
   * @param id zone id
   */
  async deleteZone(id: number): Promise<void> {
    const result = await this.zoneRepository.delete(id);

    if (result.affected == 0) throw new NotFoundException();
  }

  /**
   * Get a zone id by the zone name
   * @param name zone name
   * @param serverId server id
   */
  async getZoneIdByName(name: string, serverId: number): Promise<number> {
    const zone = await this.zoneRepository.findOne({
      where: { name, serverId },
    });

    if (!zone) throw new NotFoundException();

    return zone.id;
  }

  /**
   * Check if a zone name exists for a server
   * @param checkBy criteria to check for
   */
  async checkZoneExists(checkBy: Partial<Zone>): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: checkBy,
    });

    return zoneCount > 0;
  }

  /**
   * Check if a zone name already exists for a server
   * @param name zone name to check
   * @param serverId server id
   */
  private async validateZoneName(
    name: string,
    serverId: number,
  ): Promise<void> {
    const nameExists = await this.checkZoneExists({ name, serverId });

    if (nameExists) throw new ConflictException();
  }

  /**
   * Validate that the new inactive minutes notify are less than the inactive delete
   * @param zone zone to validate
   * @param newMinutesNotify new minutes notify to set
   * @param newMinutesDelete new minutes delete to set
   */
  private validateInactiveMinutes(
    zone: Zone,
    newIsCrawl: boolean,
    newMinutesNotify?: number,
    newMinutesDelete?: number,
  ): void {
    if (!newIsCrawl) return;

    if (zone.crawl && !newMinutesNotify && !newMinutesNotify) return;

    if (
      zone.crawl &&
      zone.minutesInactiveNotify === newMinutesNotify &&
      zone.minutesInactiveDelete === newMinutesDelete
    )
      return;

    if (
      zone.crawl &&
      newMinutesNotify &&
      newMinutesDelete &&
      newMinutesNotify <= newMinutesDelete
    )
      return;

    if (newMinutesNotify && newMinutesNotify < zone.minutesInactiveDelete)
      return;
    else if (newMinutesDelete && newMinutesDelete > zone.minutesInactiveNotify)
      return;

    throw new BadRequestException(
      propLessThanAnother('minutesInactiveNotify', 'minutesInactiveDelete'),
    );
  }
}
