import {
  Repository,
  EntityRepository,
  EntityManager,
  DeleteResult,
  In,
  InsertResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ServerGroup } from './server-group.entity';

@EntityRepository(ServerGroup)
export class ServerGroupRepository extends Repository<ServerGroup> {
  insertGroups(
    groups: QueryDeepPartialEntity<ServerGroup>[],
    manager?: EntityManager,
  ): Promise<InsertResult | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.insert(ServerGroup, groups);
  }

  saveGroups(
    groups: ServerGroup[],
    manager?: EntityManager,
  ): Promise<ServerGroup[] | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.save(groups);
  }

  deleteGroupsById(
    groups: number[],
    manager?: EntityManager,
  ): Promise<DeleteResult | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.delete(ServerGroup, {
      id: In(groups),
    });
  }
}
