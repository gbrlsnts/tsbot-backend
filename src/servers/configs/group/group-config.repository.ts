import { Repository, EntityRepository, EntityManager } from 'typeorm';
import { GroupConfig } from './group-config.entity';

@EntityRepository(GroupConfig)
export class GroupConfigRepository extends Repository<GroupConfig> {
  /**
   * Set groups for a category.
   * @param categoryId
   * @param groups
   * @param manager optional - used to wrap in a transaction
   */
  async setCategoryGroups(
    categoryId: number,
    groups: Set<number>,
    manager?: EntityManager,
  ): Promise<void> {
    if (!manager) manager = this.manager;

    if (groups) {
      await manager.delete(GroupConfig, { categoryId });
    }

    if (groups && groups.size > 0) {
      const configs = this.create(
        Array.from(groups).map(groupId => ({
          groupId,
          categoryId,
        })),
      );

      await manager.save(configs);
    }
  }
}
