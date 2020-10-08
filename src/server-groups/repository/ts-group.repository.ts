import {
  Repository,
  EntityManager,
  DeleteResult,
  In,
  InsertResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class TsGroupRepository<T> extends Repository<T> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  abstract getEntityType(): Function;

  /**
   * Insert many groups
   * @param groups
   * @param manager entity manager, use if wrapping in a transaction
   */
  insertGroups(
    groups: QueryDeepPartialEntity<T>[],
    manager?: EntityManager,
  ): Promise<InsertResult | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.insert(this.getEntityType(), groups);
  }

  /**
   * Save many groups
   * @param groups
   * @param manager entity manager, use if wrapping in a transaction
   */
  saveGroups(groups: T[], manager?: EntityManager): Promise<T[] | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.save(groups);
  }

  /**
   * Soft-delete many groups
   * @param groups
   * @param manager entity manager, use if wrapping in a transaction
   */
  deleteGroupsById(
    groups: number[],
    manager?: EntityManager,
  ): Promise<DeleteResult | undefined> {
    if (!manager) manager = this.manager;

    if (groups.length === 0) return;

    return manager.softDelete(this.getEntityType(), {
      id: In(groups),
    });
  }
}
