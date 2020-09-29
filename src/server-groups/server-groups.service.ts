import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerGroupRepository } from './server-group.repository';
import { ServerGroup } from './server-group.entity';
import { FindGroupOptions } from './groups.types';

@Injectable()
export class ServerGroupsService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    private groupRepository: ServerGroupRepository,
  ) {}

  async getGroup(
    params: Partial<ServerGroup>,
    withDeleted = false,
  ): Promise<ServerGroup> {
    const group = await this.groupRepository.findOne({
      where: params,
      withDeleted,
    });

    if (!group) throw new NotFoundException();

    return group;
  }

  /**
   * Get all groups by server id
   * @param serverId
   */
  getAllGroupsByServerId(
    serverId: number,
    options?: FindGroupOptions,
  ): Promise<ServerGroup[]> {
    const { relations, withDeleted } = options || {};

    return this.groupRepository.find({
      where: { serverId },
      relations,
      withDeleted,
    });
  }

  /**
   * Check if all given groupIds are in the given server
   * @param serverId
   * @param groupIds
   */
  async checkGroupsByServer(
    serverId: number,
    groupIds: number[],
  ): Promise<boolean> {
    const count = await this.groupRepository
      .createQueryBuilder('g')
      .where({ serverId })
      .andWhereInIds(groupIds)
      .getCount();

    return count === groupIds.length;
  }
}
