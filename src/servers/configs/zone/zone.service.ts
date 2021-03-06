import { InjectEventEmitter } from 'nest-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ZoneRepository } from './zone.repository';
import { Zone } from './zone.entity';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { propLessThanAnother } from '../../../shared/messages/global.messages';
import { CreateZoneDto } from './dto/create-zone.dto';
import {
  zoneAlreadyExists,
  zoneFirstCantBindGroup,
} from '../../../shared/messages/server.messages';
import { isNil } from '@nestjs/common/utils/shared.utils';
import {
  deleteDefaultZoneNotAllowed,
  cannotSetZoneInactive,
} from '../../../shared/messages/server.messages';
import { DbErrorCodes } from '../../../shared/database/codes';
import { FindZoneOptions } from './types';
import { ServerGroupsService } from '../../../server-groups/service/server-groups.service';
import { invalidGroup } from '../../../shared/messages/group.messages';
import { AppEventEmitter } from '../../../events/types/app.event';

export class ZoneService {
  constructor(
    @InjectEventEmitter()
    private readonly eventEmitter: AppEventEmitter,
    @InjectRepository(ZoneRepository)
    private zoneRepository: ZoneRepository,
    private groupService: ServerGroupsService,
  ) {}

  /**
   * Get all zones by server id
   * @param serverId
   */
  getAllZonesByServer(
    serverId: number,
    options?: FindZoneOptions,
  ): Promise<Zone[]> {
    const { relations, withDeleted } = options || {};

    return this.zoneRepository.find({
      where: { serverId },
      relations,
      withDeleted,
    });
  }

  /**
   * Get a zone by id
   * @param params zone search params
   */
  async getZone(params: Partial<Zone>): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({
      where: params,
      withDeleted: true,
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
    await this.validateZoneName(dto.name, serverId);

    const defaultZoneExists = await this.checkZoneExists({
      serverId,
      groupId: null,
    });

    if (!isNil(dto.groupId) && !defaultZoneExists) {
      throw new BadRequestException(zoneFirstCantBindGroup);
    }

    if (!isNil(dto.groupId)) await this.validateGroup(dto.groupId, serverId);

    const zone = this.zoneRepository.create({
      serverId,
      ...dto,
    });

    try {
      const savedZone = await this.zoneRepository.save(zone);
      this.eventEmitter.emit('zoneUpdated', savedZone);

      return savedZone;
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(zoneAlreadyExists);

      throw e;
    }
  }

  /**
   * Update a zone
   * @param id zone id
   * @param dto zone data
   */
  async updateZone(id: number, dto: UpdateZoneDto): Promise<Zone> {
    const zone = await this.getZone({ id });

    await this.validateZoneForUpdate(zone, dto);

    if (!zone.active() && dto.active) zone.deletedAt = null;

    Object.assign(zone, dto);

    try {
      const savedZone = await this.zoneRepository.save(zone);
      this.eventEmitter.emit('zoneUpdated', savedZone);

      return savedZone;
    } catch (e) {
      if (e.code == DbErrorCodes.DuplicateKey)
        throw new ConflictException(zoneAlreadyExists);

      throw e;
    }
  }

  /**
   * Delete a zone by id
   * @param id zone id
   */
  async deleteZone(id: number): Promise<void> {
    const zone = await this.getZone({ id });

    if (!zone.groupId)
      throw new BadRequestException(deleteDefaultZoneNotAllowed);

    await this.zoneRepository.delete(id);
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
   * Check if a zone exists for a server
   * @param checkBy criteria to check for
   */
  async checkZoneExists(
    checkBy: Partial<Zone>,
    withDeleted = false,
  ): Promise<boolean> {
    const zoneCount = await this.zoneRepository.count({
      where: checkBy,
      withDeleted,
    });

    return zoneCount > 0;
  }

  /**
   * Validate incoming zone data for update
   * @param zone zone from database, to be updated
   * @param dto new data to save
   */
  private async validateZoneForUpdate(
    zone: Zone,
    dto: UpdateZoneDto,
  ): Promise<void> {
    const {
      name: newName,
      minutesInactiveNotify: newMinutesNotify,
      minutesInactiveDelete: newMinutesDelete,
    } = dto;

    if (zone.name !== newName)
      await this.validateZoneName(newName, zone.serverId);

    if (!zone.groupId && dto.groupId)
      throw new BadRequestException(zoneFirstCantBindGroup);

    if (zone.groupId && dto.groupId && zone.groupId !== dto.groupId)
      await this.validateGroup(dto.groupId, zone.serverId);

    if (zone.active && dto.active === false)
      throw new BadRequestException(cannotSetZoneInactive);

    this.validateInactiveMinutes(
      zone,
      dto.crawl,
      newMinutesNotify,
      newMinutesDelete,
    );
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
    const nameExists = await this.checkZoneExists({ name, serverId }, true);

    if (nameExists) throw new ConflictException(zoneAlreadyExists);
  }

  /**
   * Check if a group is valid and active
   * @param name zone name to check
   * @param serverId server id
   */
  private async validateGroup(id: number, serverId: number): Promise<void> {
    try {
      const group = await this.groupService.getGroup({ id, serverId });

      if (!group.active()) throw new Error();
    } catch (e) {
      throw new BadRequestException(invalidGroup);
    }
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
