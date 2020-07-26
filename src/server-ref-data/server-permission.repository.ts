import { Repository, EntityRepository } from 'typeorm';
import { ServerPermission } from './server-permission.entity';

@EntityRepository(ServerPermission)
export class ServerPermissionRepository extends Repository<ServerPermission> {}