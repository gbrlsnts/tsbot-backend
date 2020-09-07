import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerGroupRepository } from './server-group.repository';
import { ServerGroup } from './server-group.entity';

@Injectable()
export class ServerGroupsService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    private groupRepository: ServerGroupRepository,
  ) {}

  /**
   * Get all groups by server id
   * @param serverId
   */
  getAllGroupsByServerId(
    serverId: number,
    relations?: string[],
  ): Promise<ServerGroup[]> {
    return this.groupRepository.find({
      where: { serverId },
      relations,
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
