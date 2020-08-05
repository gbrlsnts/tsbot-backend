import { Repository, EntityRepository } from 'typeorm';
import { ServerGroup } from './server-group.entity';

@EntityRepository(ServerGroup)
export class ServerGroupRepository extends Repository<ServerGroup> {}
