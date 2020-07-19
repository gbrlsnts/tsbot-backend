import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../../users/user.entity';
import { ServersService } from '../servers.service';
import { AppRequest } from 'src/shared/types';
import { serverRolesMetadataKey } from '../../auth/constants';

@Injectable()
export class ServerRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private serversService: ServersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();

    if (req.user.isAdmin) return true;

    const options = this.reflector.get<ServerRolesOptions>(
      serverRolesMetadataKey,
      context.getHandler(),
    );

    if (!options) return true;

    const idParam = Number(req.params[options.idParam || 'id']);

    if (!idParam) return false;

    // for now we only check for ownership
    return this.isServerOwner(req.user, idParam);
  }

  /**
   * Checks if the logged in user owns the server
   * @param user the logged in user
   * @param serverId the server id to check
   */
  private async isServerOwner(user: User, serverId: number): Promise<boolean> {
    const server = await this.serversService.getServerById(serverId);

    return server.ownerId === user.id;
  }
}

export interface ServerRolesOptions {
  /**
   * Parameter that the resource id is bound to. defaults to 'id'.
   */
  idParam?: string;

  /**
   * Roles that can access this resource
   */
  roles: ServerRoles[];
}

export enum ServerRoles {
  OWNER = 'OWNER',
}
