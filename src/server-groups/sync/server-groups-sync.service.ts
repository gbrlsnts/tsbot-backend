import { Connection, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ServerGroupRepository } from '../repository/server-group.repository';
import { ServerGroupService as TeamspeakSGroupService } from '../../teamspeak/server-groups.service';
import { IconsService } from '../../icons/icons.service';
import { ServerGroupsService } from '../service/server-groups.service';
import { Zone } from '../../servers/configs/zone/zone.entity';
import { SyncChanges } from '../groups.types';
import { GroupSyncService } from './groups-sync.service';
import { ServerGroup } from '../server-group.entity';
import { TsGroupType } from 'src/teamspeak/types/groups';

@Injectable()
export class ServerGroupSyncService extends GroupSyncService {
  constructor(
    @InjectRepository(ServerGroupRepository)
    groupRepository: ServerGroupRepository,
    groupService: ServerGroupsService,
    tsGroupService: TeamspeakSGroupService,
    iconsService: IconsService,
    private connection: Connection,
  ) {
    super(groupRepository, groupService, tsGroupService, iconsService);
  }

  /**
   * Trigger a group sync from the bot.
   * @param serverId
   */
  async syncGroupsByServerId(serverId: number): Promise<void> {
    return this.syncGroups(serverId, TsGroupType.SERVER);
  }

  /**
   * Persist all groups changes in the db
   * @param serverId server id
   * @param changes changes to persit
   */
  protected async persistChanges(
    serverId: number,
    changes: SyncChanges,
  ): Promise<void> {
    const { toInsert, toSave, toDelete } = changes;

    await this.connection.transaction(async manager => {
      await Promise.all([
        this.cascadeGroupsDeletion(manager, serverId, toDelete),
        this.groupRepository.deleteGroupsById(toDelete, manager),
        this.groupRepository.saveGroups(toSave as ServerGroup[], manager),
        this.groupRepository.insertGroups(toInsert, manager),
      ]);
    });
  }

  /**
   * Cascade soft removed groups to dependent entities
   * @param manager entity manager to wrap in transaction
   * @param serverId server id
   * @param groups groups deleted
   */
  private async cascadeGroupsDeletion(
    manager: EntityManager,
    serverId: number,
    groups: number[],
  ): Promise<void> {
    if (groups.length === 0) return;

    await manager
      .createQueryBuilder(Zone, 'z')
      .softDelete()
      .where('serverId = :serverId AND groupId IN (:...groups)', {
        serverId,
        groups,
      })
      .execute();
  }
}
