import { Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ServerGroupRepository } from './server-group.repository';
import { ServerGroupService as TeamspeakSGroupService } from '../teamspeak/server-groups.service';
import { IconsService } from '../icons/icons.service';
import { ServerGroupsService } from './server-groups.service';
import { Icon } from '../icons/icon.entity';
import { TsServerGroup } from '../teamspeak/types/groups';
import { ServerGroup } from './server-group.entity';

export class ServerGroupSyncService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    private groupRepository: ServerGroupRepository,
    private groupService: ServerGroupsService,
    private tsGroupService: TeamspeakSGroupService,
    private iconsService: IconsService,
    private connection: Connection,
  ) {}

  /**
   * Trigger a group sync from the bot.
   * @param serverId
   */
  async syncGroupsByServerId(serverId: number): Promise<void> {
    const [dbGroups, tsGroups] = await Promise.all([
      this.groupService.getAllGroupsByServerId(serverId),
      this.tsGroupService.getServerGroups(serverId),
    ]);

    const { toInsert, toSave, toDelete } = this.getChangesForSync(
      serverId,
      dbGroups,
      tsGroups,
    );

    await this.connection.transaction(async manager => {
      await Promise.all([
        this.groupRepository.deleteGroupsById(toDelete, manager),
        this.groupRepository.saveGroups(toSave, manager),
        this.groupRepository.insertGroups(toInsert, manager),
      ]);
    });

    await this.triggerGroupIconSync(serverId, tsGroups);
    await this.updateGroupIcons(serverId, tsGroups);
  }

  /**
   * Trigger a icon sync for the sync'ed groups
   * @param serverId server id
   * @param tsGroups server groups fetched from teamspeak server
   */
  private async triggerGroupIconSync(
    serverId: number,
    tsGroups: TsServerGroup[],
  ): Promise<void> {
    const iconsToSync = await this.iconsService.getMissingIconsByServer(
      serverId,
      tsGroups
        .filter(g => !isNil(g.iconId) && !Icon.localIcons.includes(g.iconId))
        .map(g => g.iconId),
    );

    if (iconsToSync.length > 0)
      await this.iconsService.syncNewServerIcons(serverId, iconsToSync);
  }

  /**
   * Update server groups with the newly sync'ed icons
   * @param serverId server id
   * @param tsGroups groups fetched from teamspeak server
   */
  private async updateGroupIcons(
    serverId: number,
    tsGroups: TsServerGroup[],
  ): Promise<void> {
    const [allGroups, dbIcons] = await Promise.all([
      this.groupService.getAllGroupsByServerId(serverId, ['icon']),
      this.iconsService.getAllIconsByTsId(
        serverId,
        tsGroups.map(g => g.iconId),
      ),
    ]);

    allGroups.forEach(g => {
      const tsGroup = tsGroups.find(tGroup => tGroup.tsId === g.tsId);
      if (!tsGroup || g?.icon?.tsId === tsGroup?.tsId) return;

      if (!tsGroup.iconId || Icon.localIcons.includes(tsGroup.iconId)) {
        g.iconId = null;
      } else {
        const dbIcon = dbIcons.find(i => i.tsId === tsGroup.iconId);
        if (!dbIcon) return;

        g.iconId = dbIcon.id;
      }

      delete g.icon; // typeorm tries to double assign iconId on update
    });

    await this.groupRepository.save(allGroups);
  }

  /**
   * Get the changes to be performed by the sync process
   * @param serverId server id
   * @param dbGroups groups in database
   * @param tsGroups groups fetched from teamspeak server
   */
  private getChangesForSync(
    serverId: number,
    dbGroups: ServerGroup[],
    tsGroups: TsServerGroup[],
  ): {
    toInsert: Partial<ServerGroup>[];
    toSave: ServerGroup[];
    toDelete: number[];
  } {
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

    return { toInsert, toSave, toDelete };
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
