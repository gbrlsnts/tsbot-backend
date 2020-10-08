import { Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ServerGroupService as TeamspeakSGroupService } from '../../teamspeak/server-groups.service';
import { IconsService } from '../../icons/icons.service';
import { SyncChanges } from '../groups.types';
import { GroupSyncService } from './groups-sync.service';
import { ServerGroup } from '../server-group.entity';
import { ChannelGroupRepository } from '../repository/channel-group.repository';
import { TsGroupType } from 'src/teamspeak/types/groups';
import { ChannelGroupsService } from '../service/channel-groups.service';

@Injectable()
export class ChannelGroupSyncService extends GroupSyncService {
  constructor(
    @InjectRepository(ChannelGroupRepository)
    groupRepository: ChannelGroupRepository,
    groupService: ChannelGroupsService,
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
    return this.syncGroups(serverId, TsGroupType.CHANNEL);
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
        this.groupRepository.deleteGroupsById(toDelete, manager),
        this.groupRepository.saveGroups(toSave as ServerGroup[], manager),
        this.groupRepository.insertGroups(toInsert, manager),
      ]);
    });
  }
}
