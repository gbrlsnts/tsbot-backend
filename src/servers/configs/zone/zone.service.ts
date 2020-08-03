import { ZoneRepository } from './zone.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from './zone.entity';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ZoneDto } from './dto/zone.dto';
import { propLessThanAnother } from '../../../shared/messages/global.messages';

export class ZoneService {
  constructor(
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
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
      where: { serverId }
    });
  }

  /**
   * Get a zone by id
   * @param id zone id
   */
  async getZoneById(id: number): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({
      where: { id }
    });

    if(!zone) throw new NotFoundException();

    return zone;
  }

  /**
   * Get a zone by id and server
   * @param id zone id
   * @param serverId server id
   */
  async getZoneIdByServer(id: number, serverId: number): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({
      where: { id, serverId }
    });

    if(!zone) throw new NotFoundException();

    return zone;
  }

  /**
   * Create a zone
   * @param serverId server id
   * @param dto zone data
   */
  async createZone(serverId: number, dto: ZoneDto): Promise<Zone> {
    const { name } = dto;
    await this.validateZoneName(name, serverId);

    const zone = this.zoneRepository.create({
      serverId,
      ...dto
    });

    return this.zoneRepository.save(zone);
  }

  /**
   * Update a zone
   * @param id zone id
   * @param dto zone data
   */
  async updateZone(id: number, dto: ZoneDto): Promise<Zone> {
    const { name: newName, minutesInactiveNotify: newMinutesNotify } = dto;
    const zone = await this.getZoneById(id);

    if(zone.name !== newName)
      await this.validateZoneName(newName, zone.serverId);

    if(zone.minutesInactiveNotify != newMinutesNotify)
      this.validateInactiveMinutes(zone, newMinutesNotify);

    Object.assign(zone, dto);

    return this.zoneRepository.save(zone);
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
   * Check if a zone name exists for a server
   * @param name zone name to check
   * @param serverId server id
   */
  async checkZoneNameExistsByServer(name: string, serverId: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { name, serverId },
    });

    return zoneCount > 0;
  }

  /**
   * Check if a zone id exists
   * @param id
   */
  async checkZoneExists(id: number): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { id },
    });

    return zoneCount > 0;
  }

  /**
   * Check if a given zone id belongs to a server
   * @param id
   * @param serverId
   */
  async checkZoneBelongsToServer(
    id: number,
    serverId: number,
  ): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: { id, serverId },
    });

    return zoneCount > 0;
  }

  /**
   * Check if a zone name already exists for a server
   * @param name zone name to check
   * @param serverId server id
   */
  private async validateZoneName(name: string, serverId: number): Promise<void> {
    const nameExists = await this.checkZoneNameExistsByServer(name, serverId);

    if(nameExists) throw new ConflictException();
  }

  /**
   * Validate that the new inactive minutes notify are less than the inactive delete
   * @param zone zone to validate
   * @param newMinutesNotify new minutes to set
   */
  private validateInactiveMinutes(zone: Zone, newMinutesNotify: number): void {
    if(newMinutesNotify < zone.minutesInactiveDelete)
      return;
    
    throw new BadRequestException(
      propLessThanAnother('minutesInactiveNotify', 'minutesInactiveDelete')
    );
  }
}
