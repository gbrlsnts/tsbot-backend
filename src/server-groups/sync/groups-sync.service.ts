import { isNil } from '@nestjs/common/utils/shared.utils';
import { ServerGroupService as TeamspeakSGroupService } from '../../teamspeak/server-groups.service';
import { IconsService } from '../../icons/icons.service';
import { Icon } from '../../icons/icon.entity';
import { TsGroup, TsGroupType } from '../../teamspeak/types/groups';
import { TsGroup as TsGroupEntity } from '../ts-group.entity';
import { SyncChanges } from '../groups.types';
import { TsGroupRepository } from '../repository/ts-group.repository';
import { TsGroupsService } from '../service/ts-groups.service';

export abstract class GroupSyncService {
  constructor(
    protected readonly groupRepository: TsGroupRepository<TsGroupEntity>,
    protected readonly groupService: TsGroupsService<TsGroupEntity>,
    protected readonly tsGroupService: TeamspeakSGroupService,
    protected readonly iconsService: IconsService,
  ) {}

  /**
   * Trigger a group sync from the bot.
   * @param serverId
   */
  abstract async syncGroupsByServerId(serverId: number): Promise<void>;

  /**
   * Sync groups with server
   * @param serverId
   */
  protected async syncGroups(
    serverId: number,
    type: TsGroupType,
  ): Promise<void> {
    const [dbGroups, tsGroups] = await Promise.all([
      this.groupService.getAllGroupsByServerId(serverId, { withDeleted: true }),
      this.tsGroupService.getServerGroups(serverId, type),
    ]);

    await this.persistChanges(
      serverId,
      this.getChangesForSync(serverId, dbGroups, tsGroups),
    );

    await this.triggerGroupIconSync(serverId, tsGroups);
    await this.updateGroupIcons(serverId, tsGroups);
  }

  /**
   * Persist all groups changes in the db
   * @param serverId server id
   * @param changes changes to persit
   */
  protected abstract async persistChanges(
    serverId: number,
    changes: SyncChanges,
  ): Promise<void>;

  /**
   * Trigger a icon sync for the sync'ed groups
   * @param serverId server id
   * @param tsGroups server groups fetched from teamspeak server
   */
  private async triggerGroupIconSync(
    serverId: number,
    tsGroups: TsGroup[],
  ): Promise<void> {
    const iconsToSync = await this.iconsService.getMissingIconsByServer(
      serverId,
      tsGroups
        .filter(g => !isNil(g.iconId) && !Icon.isLocal(g.iconId))
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
    tsGroups: TsGroup[],
  ): Promise<void> {
    const [allGroups, dbIcons] = await Promise.all([
      this.groupService.getAllGroupsByServerId(serverId, {
        relations: ['icon'],
      }),
      this.iconsService.getAllIconsByTsId(
        serverId,
        tsGroups.map(g => g.iconId),
      ),
    ]);

    allGroups.forEach(g => {
      const tsGroup = tsGroups.find(tGroup => tGroup.tsId === g.tsId);
      if (!tsGroup || g?.icon?.tsId === tsGroup?.tsId) return;

      if (!tsGroup.iconId || Icon.isLocal(tsGroup.iconId)) {
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
    dbGroups: TsGroupEntity[],
    tsGroups: TsGroup[],
  ): SyncChanges {
    const toInsert = tsGroups
      .filter(tsG => !dbGroups.find(g => g.tsId === tsG.tsId))
      .map(({ name, tsId, iconId }) => ({
        name,
        tsId,
        serverId,
        localIconId: iconId,
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
    dbGroups: TsGroupEntity[],
    tsGroups: TsGroup[],
  ): TsGroupEntity[] {
    const toSave: TsGroupEntity[] = [];

    for (const group of dbGroups) {
      const tsGroup = tsGroups.find(g => g.tsId === group.tsId);

      if (!tsGroup) continue;

      group.name = tsGroup.name;
      group.localIconId = Icon.isLocal(tsGroup.iconId) ? tsGroup.iconId : null;
      group.deletedAt = null; // in practice a group will never be restored, since TS3 doesnt reuse id's

      toSave.push(group);
    }

    return toSave;
  }
}
