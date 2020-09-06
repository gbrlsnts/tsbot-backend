import { Connection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerGroupRepository } from './server-group.repository';
import { ServerGroup } from './server-group.entity';
import { ServerGroupService as TeamspeakSGroupService } from '../teamspeak/server-groups.service';
import { TsServerGroup } from '../teamspeak/types/groups';
import { IconsService } from '../icons/icons.service';
import { Icon } from '../icons/icon.entity';

@Injectable()
export class ServerGroupsService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    private groupRepository: ServerGroupRepository,
    private tsGroupService: TeamspeakSGroupService,
    private iconsService: IconsService,
    private connection: Connection,
  ) {}

  /**
   * Get all groups by server id
   * @param serverId
   */
  getAllGroupsByServerId(serverId: number): Promise<ServerGroup[]> {
    return this.groupRepository.find({
      where: { serverId },
    });
  }

  /**
   * Trigger a group sync from the bot.
   * @param serverId
   */
  async syncGroupsByServerId(serverId: number): Promise<void> {
    const [dbGroups, tsGroups] = await Promise.all([
      this.getAllGroupsByServerId(serverId),
      this.tsGroupService.getServerGroups(serverId),
    ]);

    const toInsert = tsGroups
      .filter(tsG => !dbGroups.find(g => g.tsId === tsG.tsId))
      .map(({ name, tsId }) => ({
        name,
        tsId,
        serverId,
      }));

    const toSave = this.getServerGroupsToSave(dbGroups, tsGroups);

    const toDelete = dbGroups
      .filter(g => !tsGroups.find(tsG => tsG.tsId === g.tsId))
      .map(g => g.id);

    await this.connection.transaction(async manager => {
      await Promise.all([
        this.groupRepository.deleteGroupsById(toDelete, manager),
        this.groupRepository.saveGroups(toSave, manager),
        this.groupRepository.insertGroups(toInsert, manager),
      ]);
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

  /**
   * Get the icons list that aren't in the database
   * @param serverId server id
   * @param tsIconIds ts icons to check
   */
  async getMissingIconsByServer(
    serverId: number,
    tsIconIds: number[],
  ): Promise<number[]> {
    const dbIcons = (
      await this.groupRepository
        .createQueryBuilder('g')
        .select('i.tsId')
        .leftJoinAndMapOne('g.icon', Icon, 'i', 'i.id = g.iconId')
        .getMany()
    ).map(s => s.icon.tsId);

    return tsIconIds.filter(
      tsIcon => !dbIcons.find(dbIcon => dbIcon === tsIcon),
    );
  }

  /**
   * Get a list of server groups to be updated in the database
   * @param dbGroups server groups in database
   * @param tsGroups groups retrieved from teamspeak
   */
  private getServerGroupsToSave(
    dbGroups: ServerGroup[],
    tsGroups: TsServerGroup[],
  ): ServerGroup[] {
    const toSave: ServerGroup[] = [];

    for (const group of dbGroups) {
      const tsGroup = tsGroups.find(g => g.tsId === group.tsId);

      if (!tsGroup) continue;

      group.name = tsGroup.name;
      toSave.push(group);
    }

    return toSave;
  }
}
