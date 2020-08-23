import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ServersService } from '../servers.service';
import { AppRequest } from 'src/shared/types';
import { serverRolesMetadataKey } from '../../shared/constants';
import { ClientsService } from '../../clients/clients.service';

@Injectable()
export class ServerRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private serversService: ServersService,
    private clientsService: ClientsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();

    if (req.user.isAdmin) return true;

    const options = this.reflector.get<ServerRolesOptions>(
      serverRolesMetadataKey,
      context.getHandler(),
    );

    if (!options) return true;

    const idParam = Number(req.params[options.idParam || 'server']);

    if (!idParam) return false;

    // for now we only check for ownership
    return this.hasAccess(req.user.id, idParam, options.roles);
  }

  /**
   * Check if a user can access a resource
   * @param userId the logged in user id
   * @param serverId the server id to check
   * @param roles the roles which have access
   */
  private async hasAccess(
    userId: number,
    serverId: number,
    roles: ServerRoles[],
  ): Promise<boolean> {
    for (const role of roles) {
      switch (role) {
        case ServerRoles.OWNER:
          const isOwner = await this.isServerOwner(userId, serverId);
          if (isOwner) return true;
          break;

        case ServerRoles.CLIENT:
          const isClient = await this.isServerClient(userId, serverId);
          if (isClient) return true;
          break;
      }
    }

    return false;
  }

  /**
   * Checks if the logged in user owns the server owner
   * @param userId the id of the logged in user
   * @param serverId the server id to check
   */
  private async isServerOwner(
    userId: number,
    serverId: number,
  ): Promise<boolean> {
    const server = await this.serversService.getServerById(serverId);

    return server.ownerId === userId;
  }

  /**
   * Checks if the logged in user is a server client
   * @param user the id of the logged in user
   * @param serverId the server id to check
   */
  private async isServerClient(
    userId: number,
    serverId: number,
  ): Promise<boolean> {
    const exists = await this.clientsService.checkServerClientByUserId(
      serverId,
      userId,
    );

    return exists;
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
  CLIENT = 'CLIENT',
}
