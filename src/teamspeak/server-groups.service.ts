import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { TsServerGroup } from './types/groups';
import { getServerGroupsSubject } from './subjects';

@Injectable()
export class ServerGroupService {
  constructor(private busService: TeamspeakBusService) {}

  /**
   * Get all server groups
   * @param serverId
   */
  async getServerGroups(serverId: number): Promise<TsServerGroup[]> {
    return this.busService.send<TsServerGroup[]>(
      getServerGroupsSubject(serverId),
      '',
    );
  }
}
