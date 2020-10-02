import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { TsServerGroup, SetUserBadgesData } from './types/groups';
import { getServerGroupsSubject, setUserBadgesSubject } from './subjects';

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

  /**
   * Set a client user groups / badges
   * @param serverId server id
   * @param clientDbId client teamspeak database id
   * @param groups groups to set
   * @param allowed all allowed groups for badges
   */
  async setUserBadges(
    serverId: number,
    clientDbId: number,
    groups: number[],
    allowed: number[],
  ): Promise<void> {
    const data: SetUserBadgesData = {
      clientDatabaseId: clientDbId,
      groups,
      allowed,
    };

    return this.busService.send<void>(setUserBadgesSubject(serverId), data);
  }
}
