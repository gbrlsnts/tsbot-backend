import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ServerGroupRepository } from './server-group.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerGroup } from './server-group.entity';

@Injectable()
export class ServerGroupsService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    private groupRepository: ServerGroupRepository
  ) {}

  /**
   * Get all groups by server id
   * @param serverId 
   */
  getAllGroupsByServerId(serverId: number): Promise<ServerGroup[]> {
    return this.groupRepository.find({
      where: { serverId }
    });
  }

  /**
   * Trigger a group sync from the bot. Pending implementation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  syncGroupsByServerId(serverId: number): void {
    // this will trigger group sync from bot
    throw new InternalServerErrorException('Not Implemented');
  }
}
