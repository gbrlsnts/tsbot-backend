import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppRequest } from '../../shared/types';
import { channelRolesMetadataKey } from '../../shared/constants';
import { ChannelsService } from '../channels.service';

@Injectable()
export class ChannelRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private channelsService: ChannelsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();

    if (req.user.isAdmin) return true;

    const options = this.reflector.get<ChannelRolesOptions>(
      channelRolesMetadataKey,
      context.getHandler(),
    );

    if (!options) return true;

    const idParam = Number(req.params[options.idParam || 'channel']);

    if (!idParam) return false;

    // for now we only check for ownership
    return this.hasAccess(req.user.id, idParam);
  }

  /**
   * Check if a user can access a resource
   * @param userId the logged in user id
   * @param channelId the channel id to check
   */
  private hasAccess(userId: number, channelId: number): Promise<boolean> {
    return this.channelsService.checkUserOwnsChannelOrServer(userId, channelId);
  }
}

export interface ChannelRolesOptions {
  /**
   * Parameter that the resource id is bound to. defaults to 'channel'.
   */
  idParam?: string;

  /**
   * Roles that can access this resource
   */
  roles: ChannelRoles[];
}

export enum ChannelRoles {
  OWNER = 'OWNER',
}
