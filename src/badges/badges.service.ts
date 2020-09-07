import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ServerGroupService as TsGroupService } from '../teamspeak/server-groups.service';
import { ClientsService } from '../clients/clients.service';
import { GroupCategoryService } from '../servers/configs/group/group-category.service';
import { User } from '../users/user.entity';
import { SetBadgesDto } from './dto/set-badges.dto';
import { serverConfigurationPending } from '../shared/messages/server.messages';

@Injectable()
export class BadgesService {
  constructor(
    private tsGroupService: TsGroupService,
    private clientsService: ClientsService,
    private categoryService: GroupCategoryService,
  ) {}

  /**
   * Set badges to a user
   * @param user user to set badges
   * @param serverId server id
   * @param dto data with groups to set
   */
  async setUserBadges(
    user: User,
    serverId: number,
    dto: SetBadgesDto,
  ): Promise<void> {
    const [allowed, client] = await Promise.all([
      this.categoryService.getConfiguredGroupIdsByServer(serverId),
      this.clientsService.getServerClientByUserId(serverId, user.id),
    ]);

    if (allowed.length === 0)
      throw new UnprocessableEntityException(serverConfigurationPending);

    await this.tsGroupService.setUserBadges(
      serverId,
      client.tsClientDbId,
      dto.groups,
      allowed.map(g => g.tsId),
    );
  }
}
