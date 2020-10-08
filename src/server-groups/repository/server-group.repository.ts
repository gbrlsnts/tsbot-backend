import { EntityRepository } from 'typeorm';
import { ServerGroup } from '../server-group.entity';
import { TsGroupRepository } from './ts-group.repository';

@EntityRepository(ServerGroup)
export class ServerGroupRepository extends TsGroupRepository<ServerGroup> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  getEntityType(): Function {
    return ServerGroup;
  }
}
