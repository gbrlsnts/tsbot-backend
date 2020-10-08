import { NotFoundException } from '@nestjs/common';
import { ServerGroup } from '../server-group.entity';
import { FindGroupOptions } from '../groups.types';
import { TsGroupRepository } from '../repository/ts-group.repository';

export abstract class TsGroupsService<T> {
  constructor(protected groupRepository: TsGroupRepository<T>) {}

  async getGroup(
    params: Partial<ServerGroup>,
    withDeleted = false,
  ): Promise<T> {
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
  ): Promise<T[]> {
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
